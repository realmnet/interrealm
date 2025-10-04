export interface CreateRealmFormData {
  realmType: RealmType;
  realmId: string;
  name: string;
  parentRealmId?: string;
  containerImage: string;
  containerVersion: string;
  blockchainSync: boolean;
  description?: string;
}

export type RealmType = 'bridge' | 'internal' | 'gateway' | 'ai-agent';

export interface RealmTypeDefinition {
  id: RealmType;
  name: string;
  description: string;
  icon: string;
}

export interface CreateRealmRequest {
  realmType: RealmType;
  realmId: string;
  name: string;
  parentRealmId?: string;
  containerConfig: {
    image: string;
    version: string;
  };
  options: {
    blockchainSync: boolean;
    description?: string;
  };
}

export interface CreateRealmResponse {
  success: boolean;
  realmId: string;
  message?: string;
  errors?: string[];
}

export interface RealmFormStep {
  step: number;
  title: string;
  isComplete: boolean;
  isActive: boolean;
}