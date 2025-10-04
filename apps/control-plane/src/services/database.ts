import { Pool } from 'pg';
import type { DatabaseRealm, CreateRealmDatabaseRequest, RealmCanvas, RealmNode, RealmEdge } from '@interrealm/types';

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'interrealm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export class DatabaseService {
  static async createRealm(request: CreateRealmDatabaseRequest): Promise<DatabaseRealm> {
    const client = await pool.connect();

    try {
      // Generate realm ID in the format: realm://org.cluster-id.realm-name
      const realmId = `realm://org.${request.cluster_id}.${request.name}`;

      const query = `
        INSERT INTO realms (
          id, name, cluster_id, parent_realm_id, realm_type,
          container_image, container_version, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const values = [
        realmId,
        request.name,
        request.cluster_id,
        request.parent_realm_id || null,
        request.realm_type,
        request.container_image,
        request.container_version || 'latest',
        'pending'
      ];

      const result = await client.query(query, values);
      return result.rows[0];

    } finally {
      client.release();
    }
  }

  static async getRealm(id: string): Promise<DatabaseRealm | null> {
    const client = await pool.connect();

    try {
      const query = 'SELECT * FROM realms WHERE id = $1';
      const result = await client.query(query, [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async listRealms(clusterId?: string): Promise<DatabaseRealm[]> {
    const client = await pool.connect();

    try {
      let query = 'SELECT * FROM realms ORDER BY created_at DESC';
      let values: string[] = [];

      if (clusterId) {
        query = 'SELECT * FROM realms WHERE cluster_id = $1 ORDER BY created_at DESC';
        values = [clusterId];
      }

      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async updateRealmStatus(id: string, status: 'pending' | 'running' | 'failed' | 'stopped'): Promise<DatabaseRealm | null> {
    const client = await pool.connect();

    try {
      const query = 'UPDATE realms SET status = $1 WHERE id = $2 RETURNING *';
      const result = await client.query(query, [status, id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Canvas management methods
  static async getCanvas(clusterId: string): Promise<any | null> {
    const client = await pool.connect();

    try {
      const query = `
        SELECT * FROM realm_canvases
        WHERE cluster_id = $1
        ORDER BY updated_at DESC
        LIMIT 1
      `;
      const result = await client.query(query, [clusterId]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async listCanvases(clusterId: string): Promise<any[]> {
    const client = await pool.connect();

    try {
      const query = `
        SELECT id, name, version, deployed, last_deployed_at, created_at, updated_at
        FROM realm_canvases
        WHERE cluster_id = $1
        ORDER BY updated_at DESC
      `;
      const result = await client.query(query, [clusterId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async saveCanvas(data: {
    clusterId: string;
    name?: string;
    canvasData: RealmCanvas;
  }): Promise<any> {
    const client = await pool.connect();

    try {
      // Get the next version number
      const versionQuery = `
        SELECT COALESCE(MAX(version), 0) + 1 as next_version
        FROM realm_canvases
        WHERE cluster_id = $1
      `;
      const versionResult = await client.query(versionQuery, [data.clusterId]);
      const nextVersion = versionResult.rows[0].next_version;

      const query = `
        INSERT INTO realm_canvases (
          cluster_id, name, canvas_data, version, deployed, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `;

      const values = [
        data.clusterId,
        data.name || `Canvas v${nextVersion}`,
        JSON.stringify(data.canvasData),
        nextVersion,
        false
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async deployCanvas(canvasId: string): Promise<any> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get canvas data
      const canvasQuery = 'SELECT * FROM realm_canvases WHERE id = $1';
      const canvasResult = await client.query(canvasQuery, [canvasId]);

      if (canvasResult.rows.length === 0) {
        throw new Error('Canvas not found');
      }

      const canvas = canvasResult.rows[0];
      const canvasData = JSON.parse(canvas.canvas_data);

      // Get last deployed canvas for delta calculation
      const lastDeployedQuery = `
        SELECT * FROM realm_canvases
        WHERE cluster_id = $1 AND deployed = true
        ORDER BY last_deployed_at DESC
        LIMIT 1
      `;
      const lastDeployedResult = await client.query(lastDeployedQuery, [canvas.cluster_id]);

      const lastDeployed = lastDeployedResult.rows[0];
      const lastCanvasData = lastDeployed ? JSON.parse(lastDeployed.canvas_data) : { nodes: [], edges: [] };

      // Calculate deltas
      const delta = this.computeCanvasDelta(lastCanvasData, canvasData);

      // Apply realm additions
      for (const node of delta.realmsAdded) {
        const contractsSatisfied = this.checkContractsSatisfied(node, canvasData.edges);

        const realmQuery = `
          INSERT INTO realms (
            id, name, cluster_id, namespace, status, config, metadata, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            status = EXCLUDED.status,
            config = EXCLUDED.config,
            metadata = EXCLUDED.metadata,
            updated_at = NOW()
        `;

        const realmValues = [
          node.id,
          node.name,
          canvas.cluster_id,
          `realm-${node.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          contractsSatisfied ? 'pending' : 'error',
          JSON.stringify({
            port: 8080,
            replicas: 1,
            resources: {
              requests: { cpu: '100m', memory: '128Mi' },
              limits: { cpu: '500m', memory: '512Mi' }
            }
          }),
          JSON.stringify({
            canvasNodeId: node.id,
            realmType: node.type,
            position: node.meta
          })
        ];

        await client.query(realmQuery, realmValues);
      }

      // Apply realm deletions
      for (const realmId of delta.realmsRemoved) {
        const deleteQuery = 'UPDATE realms SET status = $1, updated_at = NOW() WHERE id = $2';
        await client.query(deleteQuery, ['deleting', realmId]);
      }

      // Handle edges (contracts/connections)
      for (const edge of delta.edgesAdded) {
        const contractQuery = `
          INSERT INTO contracts (
            name, version, source_realm_id, target_realm_id, schema, validation, status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          ON CONFLICT (name, version) DO NOTHING
        `;

        const contractValues = [
          `${edge.source}-${edge.target}`,
          '1.0.0',
          edge.source,
          edge.target,
          JSON.stringify({ type: edge.type || 'service' }),
          JSON.stringify({}),
          'active'
        ];

        await client.query(contractQuery, contractValues);
      }

      // Mark canvas as deployed
      const updateCanvasQuery = `
        UPDATE realm_canvases
        SET deployed = true, last_deployed_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `;
      await client.query(updateCanvasQuery, [canvasId]);

      await client.query('COMMIT');

      return {
        deployed: true,
        delta,
        realmsCreated: delta.realmsAdded.length,
        realmsDeleted: delta.realmsRemoved.length,
        contractsCreated: delta.edgesAdded.length
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getCanvasDeploymentStatus(canvasId: string): Promise<any> {
    const client = await pool.connect();

    try {
      const query = `
        SELECT
          c.id,
          c.deployed,
          c.last_deployed_at,
          c.canvas_data,
          COUNT(r.id) as total_realms,
          COUNT(CASE WHEN r.status = 'running' THEN 1 END) as running_realms,
          COUNT(CASE WHEN r.status = 'error' THEN 1 END) as error_realms,
          COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_realms
        FROM realm_canvases c
        LEFT JOIN realms r ON r.cluster_id = c.cluster_id
        WHERE c.id = $1
        GROUP BY c.id, c.deployed, c.last_deployed_at, c.canvas_data
      `;

      const result = await client.query(query, [canvasId]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  private static computeCanvasDelta(
    previous: { nodes: any[], edges: any[] },
    current: { nodes: any[], edges: any[] }
  ) {
    const prevNodeMap = new Map(previous.nodes.map(n => [n.id, n]));
    const currNodeMap = new Map(current.nodes.map(n => [n.id, n]));

    return {
      realmsAdded: current.nodes.filter(n => !prevNodeMap.has(n.id)),
      realmsRemoved: previous.nodes
        .filter(n => !currNodeMap.has(n.id))
        .map(n => n.id),
      realmsModified: current.nodes.filter(n => {
        const prev = prevNodeMap.get(n.id);
        return prev && JSON.stringify(prev) !== JSON.stringify(n);
      }),
      edgesAdded: current.edges.filter(e =>
        !previous.edges.find(pe => pe.id === e.id)
      ),
      edgesRemoved: previous.edges
        .filter(e => !current.edges.find(ce => ce.id === e.id))
        .map(e => e.id)
    };
  }

  private static checkContractsSatisfied(node: any, edges: any[]): boolean {
    if (!node.contract?.inputs) return true;

    const requiredInputs = node.contract.inputs.filter((i: any) => i.required);

    return requiredInputs.every((input: any) =>
      edges.some(e =>
        e.target === node.id &&
        e.type === input.type
      )
    );
  }
}