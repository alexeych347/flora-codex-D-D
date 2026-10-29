import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPlayer {
  id: string;
  role: 'PLAYER' | 'MASTER';
}

export interface AuthRequest extends Request {
  player?: AuthPlayer | null;
}

function verifyToken(token: string): AuthPlayer | null {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as AuthPlayer;
    return { id: payload.id, role: payload.role };
  } catch {
    return null;
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  const player = token ? verifyToken(token) : null;

  if (!player) {
    res.status(401).json({ error: 'Недействительный токен' });
    return;
  }

  req.player = player;
  next();
}

export function requireMaster(req: AuthRequest, res: Response, next: NextFunction) {
  authMiddleware(req, res, () => {
    if (req.player?.role !== 'MASTER') {
      res.status(403).json({ error: 'Доступно только мастеру' });
      return;
    }
    next();
  });
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  req.player = token ? verifyToken(token) : null;
  next();
}
