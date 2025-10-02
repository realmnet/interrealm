import { z } from 'zod';

const SchemaFieldSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.enum(['string', 'number', 'boolean', 'object', 'array']),
    required: z.boolean().optional(),
    description: z.string().optional(),
    default: z.any().optional(),
    enum: z.array(z.any()).optional(),
    properties: z.record(SchemaFieldSchema).optional(),
    items: SchemaFieldSchema.optional()
  })
);

export const ContractSchemaSchema = z.object({
  request: z.object({
    headers: z.record(SchemaFieldSchema).optional(),
    body: z.record(SchemaFieldSchema).optional(),
    params: z.record(SchemaFieldSchema).optional()
  }),
  response: z.object({
    headers: z.record(SchemaFieldSchema).optional(),
    body: z.record(SchemaFieldSchema).optional()
  })
});

export const ValidationRulesSchema = z.object({
  requestTimeout: z.number().min(100).max(30000).optional(),
  maxRetries: z.number().min(0).max(5).optional(),
  rateLimit: z.object({
    requests: z.number().min(1),
    window: z.number().min(1)
  }).optional(),
  authentication: z.object({
    type: z.enum(['none', 'api-key', 'jwt', 'oauth2']),
    config: z.record(z.any()).optional()
  }).optional()
});

export const CreateContractSchema = z.object({
  name: z.string().min(1).max(255),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string().optional(),
  sourceRealmId: z.string().uuid(),
  targetRealmId: z.string().uuid(),
  schema: ContractSchemaSchema,
  validation: ValidationRulesSchema
});

export const UpdateContractSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  schema: ContractSchemaSchema.optional(),
  validation: ValidationRulesSchema.optional(),
  status: z.enum(['draft', 'active', 'deprecated', 'archived']).optional()
});

export type CreateContractInput = z.infer<typeof CreateContractSchema>;
export type UpdateContractInput = z.infer<typeof UpdateContractSchema>;