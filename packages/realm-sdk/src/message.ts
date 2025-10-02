export interface RealmMessage {
  id: string;
  sourceRealm: string;
  targetRealm: string;
  timestamp: number;
  payload: any;
  headers?: Record<string, string>;
  routing?: {
    path: string[];
    ttl: number;
  };
}

export function createMessage(
  sourceRealm: string,
  targetRealm: string,
  payload: any
): RealmMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    sourceRealm,
    targetRealm,
    timestamp: Date.now(),
    payload,
    routing: {
      path: [sourceRealm],
      ttl: 10
    }
  };
}