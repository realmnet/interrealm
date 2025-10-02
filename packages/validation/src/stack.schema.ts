import { z } from 'zod';

export const CreateStackSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  realms: z.array(z.string().uuid()).min(1),
  connections: z.array(z.object({
    sourceRealmId: z.string().uuid(),
    targetRealmId: z.string().uuid(),
    protocol: z.enum(['http', 'grpc', 'websocket']),
    config: z.record(z.any()).optional()
  })).optional()
});

export const UpdateStackSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  realms: z.array(z.string().uuid()).optional(),
  connections: z.array(z.object({
    sourceRealmId: z.string().uuid(),
    targetRealmId: z.string().uuid(),
    protocol: z.enum(['http', 'grpc', 'websocket']),
    config: z.record(z.any()).optional()
  })).optional()
});

export type CreateStackInput = z.infer<typeof CreateStackSchema>;
export type UpdateStackInput = z.infer<typeof UpdateStackSchema>;