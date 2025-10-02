export interface Cluster {
  id: string;
  name: string;
  region: string;
  provider: CloudProvider;
  endpoint: string;
  status: ClusterStatus;
  metadata: ClusterMetadata;
  resources: ClusterResources;
  createdAt: Date;
  updatedAt: Date;
}

export enum CloudProvider {
  AWS = 'aws',
  GCP = 'gcp',
  AZURE = 'azure',
  LOCAL = 'local'
}

export enum ClusterStatus {
  PROVISIONING = 'provisioning',
  ACTIVE = 'active',
  UPDATING = 'updating',
  DEGRADED = 'degraded',
  ERROR = 'error'
}

export interface ClusterMetadata {
  kubernetesVersion: string;
  istioVersion: string;
  nodeCount: number;
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

export interface ClusterResources {
  cpu: {
    total: number;
    allocated: number;
    available: number;
  };
  memory: {
    total: number;
    allocated: number;
    available: number;
  };
  storage: {
    total: number;
    allocated: number;
    available: number;
  };
}

export interface ClusterRegistration {
  name: string;
  region: string;
  provider: CloudProvider;
  endpoint: string;
  kubeconfig?: string;
  metadata?: Partial<ClusterMetadata>;
}