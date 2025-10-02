export interface Realm {
  id: string;
  name: string;
  description?: string;
  clusterId: string;
  namespace: string;
  status: RealmStatus;
  config: RealmConfig;
  metadata: RealmMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export enum RealmStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  STOPPED = 'stopped',
  ERROR = 'error'
}

export interface RealmConfig {
  port: number;
  replicas: number;
  resources: {
    requests: {
      cpu: string;
      memory: string;
    };
    limits: {
      cpu: string;
      memory: string;
    };
  };
  environment: Record<string, string>;
  neighbors: string[];
}

export interface RealmMetadata {
  labels: Record<string, string>;
  annotations: Record<string, string>;
  version: string;
}

export interface RealmStack {
  id: string;
  name: string;
  realms: Realm[];
  connections: RealmConnection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RealmConnection {
  id: string;
  sourceRealmId: string;
  targetRealmId: string;
  protocol: 'http' | 'grpc' | 'websocket';
  config: ConnectionConfig;
}

export interface ConnectionConfig {
  timeout?: number;
  retries?: number;
  rateLimit?: number;
  headers?: Record<string, string>;
}