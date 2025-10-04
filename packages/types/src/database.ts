// Database schema types matching PostgreSQL structure

export interface RealmCluster {
  id: string; // UUID
  name: string;
  kubeconfig?: string; // encrypted connection details
  status: 'active' | 'offline' | 'maintenance';
  created_at: Date;
}

export interface DatabaseRealm {
  id: string; // realm://org.cluster-id.realm-name
  name: string;
  cluster_id: string; // UUID
  parent_realm_id?: string;
  realm_type: 'bridge' | 'internal' | 'gateway' | 'ai-agent';
  container_image: string;
  container_version: string;
  status: 'pending' | 'running' | 'failed' | 'stopped';
  created_at: Date;
}

export interface RoutingPolicy {
  id: string; // UUID
  source_realm_id: string;
  target_realm_id: string;
  via_realm_id?: string;
  allowed: boolean;
  direct_bridge: boolean;
  created_at: Date;
}

// Request/Response types for API
export interface CreateRealmDatabaseRequest {
  name: string;
  cluster_id: string;
  parent_realm_id?: string;
  realm_type: 'bridge' | 'internal' | 'gateway' | 'ai-agent';
  container_image: string;
  container_version?: string;
}

export interface CreateRealmDatabaseResponse {
  success: boolean;
  realm?: DatabaseRealm;
  error?: string;
}