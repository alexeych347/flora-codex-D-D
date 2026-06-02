import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res: Response) => {
  const { password } = req.body;

  if (!password || password !== process.env.DM_PASSWORD) {
    res.status(401).json({ error: 'Неверный пароль' });
    return;
  }

  const token = jwt.sign(
    { role: 'DM' },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );

  res.json({ token });
});

// GET /api/auth/verify
router.get('/verify', authMiddleware, (_req, res: Response) => {
  res.json({ valid: true });
});

export default router;
