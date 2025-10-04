import { Router } from 'express';
import { z } from 'zod';
import { DatabaseService } from '../services/database.js';
import type { RealmNode, RealmEdge, RealmCanvas } from '@interrealm/types';

const router = Router();

// Validation schemas
const saveCanvasSchema = z.object({
  clusterId: z.string().uuid(),
  name: z.string().optional(),
  nodes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['realm', 'bridge', 'gateway', 'ui-realm']),
    status: z.enum(['running', 'stopped', 'error', 'pending']).optional(),
    contract: z.object({
      inputs: z.array(z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(['service', 'event', 'data']),
        required: z.boolean(),
        satisfied: z.boolean().optional()
      })),
      outputs: z.array(z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(['service', 'event', 'broadcast'])
      }))
    }).optional(),
    inputsSatisfied: z.boolean().optional(),
    data: z.record(z.any()).optional(),
    meta: z.object({
      x: z.number(),
      y: z.number(),
      expanded: z.boolean().optional(),
      color: z.string().optional(),
      icon: z.string().optional()
    })
  })),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string().optional(),
    targetHandle: z.string().optional(),
    type: z.enum(['parent-child', 'service', 'event-producer', 'event-consumer', 'broadcast']).optional(),
    animated: z.boolean().optional(),
    label: z.string().optional(),
    data: z.record(z.any()).optional()
  }))
});

// GET /api/v1/canvas/:clusterId - Get canvas for cluster
router.get('/:clusterId', async (req, res) => {
  try {
    const canvas = await DatabaseService.getCanvas(req.params.clusterId);
    if (!canvas) {
      return res.status(404).json({ error: 'Canvas not found' });
    }
    res.json({ canvas });
  } catch (error) {
    console.error('Error getting canvas:', error);
    res.status(500).json({ error: 'Failed to get canvas' });
  }
});

// GET /api/v1/canvas/list/:clusterId - List all canvas versions for cluster
router.get('/list/:clusterId', async (req, res) => {
  try {
    const canvases = await DatabaseService.listCanvases(req.params.clusterId);
    res.json({ canvases });
  } catch (error) {
    console.error('Error listing canvases:', error);
    res.status(500).json({ error: 'Failed to list canvases' });
  }
});

// POST /api/v1/canvas/save - Save canvas (no deployment)
router.post('/save', async (req, res) => {
  try {
    const validationResult = saveCanvasSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      });
    }

    const { clusterId, name, nodes, edges } = validationResult.data;

    const canvas = await DatabaseService.saveCanvas({
      clusterId,
      name,
      canvasData: {
        nodes: nodes as (RealmNode & { meta: any })[],
        edges: edges as RealmEdge[],
        lastUpdated: new Date().toISOString(),
        layout: 'freeform' as const
      }
    });

    res.json({
      success: true,
      canvas,
      message: 'Canvas saved successfully'
    });
  } catch (error) {
    console.error('Error saving canvas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save canvas'
    });
  }
});

// POST /api/v1/canvas/deploy/:canvasId - Deploy canvas
router.post('/deploy/:canvasId', async (req, res) => {
  try {
    const result = await DatabaseService.deployCanvas(req.params.canvasId);
    res.json({
      success: true,
      ...result,
      message: 'Canvas deployed successfully'
    });
  } catch (error) {
    console.error('Error deploying canvas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deploy canvas'
    });
  }
});

// GET /api/v1/canvas/status/:canvasId - Get deployment status of canvas
router.get('/status/:canvasId', async (req, res) => {
  try {
    const status = await DatabaseService.getCanvasDeploymentStatus(req.params.canvasId);
    res.json({ status });
  } catch (error) {
    console.error('Error getting canvas status:', error);
    res.status(500).json({ error: 'Failed to get canvas status' });
  }
});

export { router as canvasRoutes };