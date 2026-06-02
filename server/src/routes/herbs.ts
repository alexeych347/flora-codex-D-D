import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `herb-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения: jpeg, jpg, png, gif, webp'));
    }
  },
});

// GET /api/herbs
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const herbs = await prisma.herb.findMany({ orderBy: { sortOrder: 'asc' } });

    if (req.isDM) {
      res.json(herbs);
      return;
    }

    const sanitized = herbs.map(herb => {
      if (!herb.isUnlocked) {
        return { id: herb.id, isUnlocked: false, sortOrder: herb.sortOrder, rarity: herb.rarity };
      }
      return herb;
    });

    res.json(sanitized);
  } catch {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/herbs/search
router.get('/search', optionalAuth, async (req: AuthRequest, res: Response) => {
  const q = (req.query.q as string || '').toLowerCase().trim();
  if (!q) {
    res.json([]);
    return;
  }

  try {
    const herbs = await prisma.herb.findMany({
      where: req.isDM ? {} : { isUnlocked: true },
      orderBy: { sortOrder: 'asc' },
    });

    const results = herbs.filter(herb =>
      herb.name.toLowerCase().includes(q) ||
      herb.latinName.toLowerCase().includes(q) ||
      herb.properties.some(p => p.toLowerCase().includes(q)) ||
      herb.effects.toLowerCase().includes(q)
    );

    res.json(results);
  } catch {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/herbs/:id
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const herb = await prisma.herb.findUnique({ where: { id: req.params.id } });

    if (!herb) {
      res.status(404).json({ error: 'Трава не найдена' });
      return;
    }

    if (!herb.isUnlocked && !req.isDM) {
      res.json({ id: herb.id, isUnlocked: false, sortOrder: herb.sortOrder, rarity: herb.rarity });
      return;
    }

    res.json(herb);
  } catch {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/herbs
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, latinName, imageUrl, rarity, discoveredAt, description, properties, effects, isUnlocked, sortOrder } = req.body;

    const herb = await prisma.herb.create({
      data: {
        name,
        latinName,
        imageUrl,
        rarity: rarity || 'COMMON',
        discoveredAt,
        description,
        properties: properties || [],
        effects,
        isUnlocked: isUnlocked ?? false,
        sortOrder: sortOrder ?? 0,
      },
    });

    res.status(201).json(herb);
  } catch {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/herbs/:id
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, latinName, imageUrl, rarity, discoveredAt, description, properties, effects, isUnlocked, sortOrder } = req.body;

    const herb = await prisma.herb.update({
      where: { id: req.params.id },
      data: { name, latinName, imageUrl, rarity, discoveredAt, description, properties: properties || [], effects, isUnlocked, sortOrder },
    });

    res.json(herb);
  } catch {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PATCH /api/herbs/:id/unlock
router.patch('/:id/unlock', authMiddleware, async (req: Request, res: Response) => {
  try {
    const herb = await prisma.herb.findUnique({ where: { id: req.params.id } });

    if (!herb) {
      res.status(404).json({ error: 'Трава не найдена' });
      return;
    }

    const updated = await prisma.herb.update({
      where: { id: req.params.id },
      data: { isUnlocked: !herb.isUnlocked },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/herbs/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await prisma.herb.delete({ where: { id: req.params.id } });
    res.json({ message: 'Трава удалена' });
  } catch {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/herbs/:id/image
router.post('/:id/image', authMiddleware, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Файл не загружен' });
      return;
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const herb = await prisma.herb.update({
      where: { id: req.params.id },
      data: { imageUrl },
    });

    res.json(herb);
  } catch {
    res.status(500).json({ error: 'Ошибка загрузки файла' });
  }
});

export default router;
