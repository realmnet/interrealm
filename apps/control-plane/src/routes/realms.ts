import { Router } from 'express';
import { z } from 'zod';
import { DatabaseService } from '../services/database.js';
import type { CreateRealmRequest, CreateRealmResponse } from '@interrealm/types';

const router = Router();

// Validation schema for create realm request
const createRealmSchema = z.object({
  realmType: z.enum(['bridge', 'internal', 'gateway', 'ai-agent']),
  realmId: z.string().min(1),
  name: z.string().min(1),
  parentRealmId: z.string().optional(),
  containerConfig: z.object({
    image: z.string().min(1),
    version: z.string().default('latest')
  }),
  options: z.object({
    blockchainSync: z.boolean().default(false),
    description: z.string().optional()
  }).optional()
});

// GET /api/v1/realms - List all realms
router.get('/', async (req, res) => {
  try {
    const clusterId = req.query.clusterId as string | undefined;
    const realms = await DatabaseService.listRealms(clusterId);
    res.json({ realms });
  } catch (error) {
    console.error('Error listing realms:', error);
    res.status(500).json({ error: 'Failed to list realms' });
  }
});

// GET /api/v1/realms/:id - Get specific realm
router.get('/:id', async (req, res) => {
  try {
    const realm = await DatabaseService.getRealm(req.params.id);
    if (!realm) {
      return res.status(404).json({ error: 'Realm not found' });
    }
    res.json({ realm });
  } catch (error) {
    console.error('Error getting realm:', error);
    res.status(500).json({ error: 'Failed to get realm' });
  }
});

// POST /api/v1/realms - Create new realm
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const validationResult = createRealmSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      });
    }

    const data = validationResult.data;

    // For now, we'll use a default cluster ID since we don't have cluster management yet
    const defaultClusterId = process.env.DEFAULT_CLUSTER_ID || '00000000-0000-0000-0000-000000000000';

    // Convert frontend format to database format
    const dbRequest = {
      name: data.name,
      cluster_id: defaultClusterId,
      parent_realm_id: data.parentRealmId,
      realm_type: data.realmType,
      container_image: data.containerConfig.image,
      container_version: data.containerConfig.version
    };

    const realm = await DatabaseService.createRealm(dbRequest);

    const response: CreateRealmResponse = {
      success: true,
      realmId: realm.id,
      message: 'Realm created successfully'
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Error creating realm:', error);

    const response: CreateRealmResponse = {
      success: false,
      realmId: '',
      errors: ['Failed to create realm']
    };

    res.status(500).json(response);
  }
});

// PATCH /api/v1/realms/:id/status - Update realm status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'running', 'failed', 'stopped'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedRealm = await DatabaseService.updateRealmStatus(req.params.id, status);

    if (!updatedRealm) {
      return res.status(404).json({ error: 'Realm not found' });
    }

    res.json({ realm: updatedRealm });

  } catch (error) {
    console.error('Error updating realm status:', error);
    res.status(500).json({ error: 'Failed to update realm status' });
  }
});

export { router as realmRoutes };