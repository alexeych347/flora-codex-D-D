import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  isDM?: boolean;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Токен не предоставлен' });
    return;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.isDM = true;
    next();
  } catch {
    res.status(401).json({ error: 'Недействительный токен' });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      req.isDM = true;
    } catch {
      req.isDM = false;
    }
  } else {
    req.isDM = false;
  }

  next();
}
