export interface Contract {
  id: string;
  name: string;
  version: string;
  description?: string;
  sourceRealmId: string;
  targetRealmId: string;
  schema: ContractSchema;
  validation: ValidationRules;
  status: ContractStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum ContractStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived'
}

export interface ContractSchema {
  request: {
    headers?: Record<string, SchemaField>;
    body?: Record<string, SchemaField>;
    params?: Record<string, SchemaField>;
  };
  response: {
    headers?: Record<string, SchemaField>;
    body?: Record<string, SchemaField>;
  };
}

export interface SchemaField {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  description?: string;
  default?: any;
  enum?: any[];
  properties?: Record<string, SchemaField>;
  items?: SchemaField;
}

export interface ValidationRules {
  requestTimeout?: number;
  maxRetries?: number;
  rateLimit?: {
    requests: number;
    window: number;
  };
  authentication?: {
    type: 'none' | 'api-key' | 'jwt' | 'oauth2';
    config?: Record<string, any>;
  };
}