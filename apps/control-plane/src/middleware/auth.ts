import type { Request, Response, NextFunction } from 'express';

// TODO: Remove hardcoded key before production deployment
const API_KEY = process.env.CONTROL_PLANE_API_KEY || 'dev-test-key-12345';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid API key required'
    });
  }

  next();
}