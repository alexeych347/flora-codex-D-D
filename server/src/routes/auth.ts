import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/auth/players — публичный список для экрана входа (без паролей)
router.get('/players', async (_req: Request, res: Response) => {
  const players = await prisma.player.findMany({
    select: { slug: true, name: true, role: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json(players.map((p) => ({ id: p.slug, name: p.name, role: p.role })));
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { playerId, password } = req.body;

  const player = playerId ? await prisma.player.findUnique({ where: { slug: playerId } }) : null;
  if (!player || !password || !(await bcrypt.compare(password, player.passwordHash))) {
    res.status(401).json({ error: 'Неверный пароль' });
    return;
  }

  const token = jwt.sign(
    { id: player.id, role: player.role },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );

  res.json({ token, player: { id: player.slug, name: player.name, role: player.role } });
});

// GET /api/auth/verify
router.get('/verify', authMiddleware, async (req: AuthRequest, res: Response) => {
  const player = await prisma.player.findUnique({ where: { id: req.player!.id } });
  if (!player) {
    res.status(401).json({ error: 'Игрок не найден' });
    return;
  }
  res.json({ player: { id: player.slug, name: player.name, role: player.role } });
});

export default router;
