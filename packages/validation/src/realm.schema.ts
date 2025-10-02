import { z } from 'zod';

export const RealmConfigSchema = z.object({
  port: z.number().min(1).max(65535),
  replicas: z.number().min(1).max(10).default(1),
  resources: z.object({
    requests: z.object({
      cpu: z.string().regex(/^\d+m?$/),
      memory: z.string().regex(/^\d+(Mi|Gi)$/)
    }),
    limits: z.object({
      cpu: z.string().regex(/^\d+m?$/),
      memory: z.string().regex(/^\d+(Mi|Gi)$/)
    })
  }),
  environment: z.record(z.string()),
  neighbors: z.array(z.string())
});

export const RealmMetadataSchema = z.object({
  labels: z.record(z.string()),
  annotations: z.record(z.string()),
  version: z.string()
});

export const CreateRealmSchema = z.object({
  name: z.string().min(1).max(63).regex(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/),
  description: z.string().optional(),
  clusterId: z.string().uuid(),
  namespace: z.string().min(1).max(63),
  config: RealmConfigSchema,
  metadata: RealmMetadataSchema
});

export const UpdateRealmSchema = z.object({
  name: z.string().min(1).max(63).optional(),
  description: z.string().optional(),
  config: RealmConfigSchema.partial(),
  metadata: RealmMetadataSchema.partial()
});

export const RealmConnectionSchema = z.object({
  sourceRealmId: z.string().uuid(),
  targetRealmId: z.string().uuid(),
  protocol: z.enum(['http', 'grpc', 'websocket']),
  config: z.object({
    timeout: z.number().optional(),
    retries: z.number().optional(),
    rateLimit: z.number().optional(),
    headers: z.record(z.string()).optional()
  })
});

export type CreateRealmInput = z.infer<typeof CreateRealmSchema>;
export type UpdateRealmInput = z.infer<typeof UpdateRealmSchema>;
export type RealmConnectionInput = z.infer<typeof RealmConnectionSchema>;