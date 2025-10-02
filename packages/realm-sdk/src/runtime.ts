import express from 'express';
import { RealmMessage, createMessage } from './message';

export interface RealmConfig {
  realmId: string;
  port: number;
  neighbors?: string[];
}

export class RealmRuntime {
  private app: express.Application;
  private config: RealmConfig;
  private messageHandlers: Map<string, (message: RealmMessage) => void>;

  constructor(config: RealmConfig) {
    this.config = config;
    this.app = express();
    this.messageHandlers = new Map();

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      console.log(`[${this.config.realmId}] ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes() {
    this.app.post('/message', (req, res) => {
      const message: RealmMessage = req.body;
      console.log(`[${this.config.realmId}] Received message from ${message.sourceRealm}`);

      if (message.targetRealm === this.config.realmId) {
        this.handleMessage(message);
        res.json({ status: 'delivered' });
      } else {
        this.routeMessage(message);
        res.json({ status: 'routing' });
      }
    });

    this.app.get('/health', (req, res) => {
      res.json({
        realm: this.config.realmId,
        status: 'healthy',
        timestamp: Date.now()
      });
    });
  }

  private handleMessage(message: RealmMessage) {
    const handler = this.messageHandlers.get(message.payload?.type || 'default');
    if (handler) {
      handler(message);
    } else {
      console.log(`[${this.config.realmId}] No handler for message type: ${message.payload?.type}`);
    }
  }

  private async routeMessage(message: RealmMessage) {
    if (!message.routing) return;

    message.routing.path.push(this.config.realmId);
    message.routing.ttl--;

    if (message.routing.ttl <= 0) {
      console.log(`[${this.config.realmId}] Message TTL expired`);
      return;
    }

    for (const neighbor of this.config.neighbors || []) {
      if (!message.routing.path.includes(neighbor)) {
        try {
          await this.forwardMessage(message, neighbor);
          break;
        } catch (error) {
          console.error(`[${this.config.realmId}] Failed to forward to ${neighbor}:`, error);
        }
      }
    }
  }

  private async forwardMessage(message: RealmMessage, targetUrl: string) {
    const response = await fetch(`${targetUrl}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`Forward failed: ${response.status}`);
    }
  }

  public on(messageType: string, handler: (message: RealmMessage) => void) {
    this.messageHandlers.set(messageType, handler);
  }

  public async send(targetRealm: string, payload: any) {
    const message = createMessage(this.config.realmId, targetRealm, payload);
    await this.routeMessage(message);
  }

  public start() {
    this.app.listen(this.config.port, () => {
      console.log(`[${this.config.realmId}] Realm running on port ${this.config.port}`);
      console.log(`[${this.config.realmId}] Neighbors: ${this.config.neighbors?.join(', ') || 'none'}`);
    });
  }
}