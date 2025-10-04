export interface RealmNodeMeta {
  x: number;
  y: number;
  expanded?: boolean;
  color?: string;
  icon?: string;
}

export interface RealmContract {
  inputs: RealmInput[];
  outputs: RealmOutput[];
}

export interface RealmInput {
  id: string;
  name: string;
  type: 'service' | 'event' | 'data';
  required: boolean;
  satisfied?: boolean;
}

export interface RealmOutput {
  id: string;
  name: string;
  type: 'service' | 'event' | 'broadcast';
}

export interface RealmNode {
  id: string;
  name: string;
  type: 'realm' | 'bridge' | 'gateway' | 'ui-realm';
  status?: 'running' | 'stopped' | 'error' | 'pending';
  contract?: RealmContract;
  inputsSatisfied?: boolean;
  data?: Record<string, any>;
}

export interface RealmEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: 'parent-child' | 'service' | 'event-producer' | 'event-consumer' | 'broadcast';
  animated?: boolean;
  label?: string;
  data?: Record<string, any>;
}

export interface RealmCanvas {
  nodes: (RealmNode & { meta: RealmNodeMeta })[];
  edges: RealmEdge[];
  lastUpdated: string;
  layout?: "hierarchical" | "freeform";
}