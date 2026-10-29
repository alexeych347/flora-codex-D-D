import { Router, Request, Response } from 'express';
import { Herb, PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { optionalAuth, requireMaster, AuthRequest } from '../middleware/auth';

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

function lockedStub(herb: Herb) {
  return { id: herb.id, isUnlocked: false as const, sortOrder: herb.sortOrder, rarity: herb.rarity };
}

// для не-мастера: набор id трав, к которым у текущего игрока есть персональный доступ
async function grantedHerbIds(playerId: string): Promise<Set<string>> {
  const rows = await prisma.herbAccess.findMany({ where: { playerId }, select: { herbId: true } });
  return new Set(rows.map((r) => r.herbId));
}

// для мастера: herbId -> [slug, slug, ...] игроков с доступом
async function accessByHerb(): Promise<Map<string, string[]>> {
  const rows = await prisma.herbAccess.findMany({ include: { player: { select: { slug: true } } } });
  const map = new Map<string, string[]>();
  for (const row of rows) {
    const list = map.get(row.herbId) || [];
    list.push(row.player.slug);
    map.set(row.herbId, list);
  }
  return map;
}

// GET /api/herbs
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const herbs = await prisma.herb.findMany({ orderBy: { createdAt: 'asc' } });

    if (req.player?.role === 'MASTER') {
      const access = await accessByHerb();
      res.json(herbs.map((h) => ({ ...h, isUnlocked: true, access: access.get(h.id) || [] })));
      return;
    }

    if (req.player) {
      const granted = await grantedHerbIds(req.player.id);
      res.json(herbs.map((h) => (granted.has(h.id) ? { ...h, isUnlocked: true } : lockedStub(h))));
      return;
    }

    res.json(herbs.map(lockedStub));
  } catch (err) {
    console.error('[GET /api/herbs]', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/herbs/search
router.get('/search', optionalAuth, async (req: AuthRequest, res: Response) => {
  const q = ((req.query.q as string) || '').toLowerCase().trim();
  if (!q) {
    res.json([]);
    return;
  }

  try {
    let herbs = await prisma.herb.findMany({ orderBy: { createdAt: 'asc' } });

    if (req.player?.role !== 'MASTER') {
      const granted = req.player ? await grantedHerbIds(req.player.id) : new Set<string>();
      herbs = herbs.filter((h) => granted.has(h.id));
    }

    const results = herbs.filter(
      (herb) =>
        herb.name.toLowerCase().includes(q) ||
        herb.latinName.toLowerCase().includes(q) ||
        herb.properties.some((p) => p.toLowerCase().includes(q)) ||
        herb.effects.toLowerCase().includes(q)
    );

    res.json(results.map((h) => ({ ...h, isUnlocked: true as const })));
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

    if (req.player?.role === 'MASTER') {
      const access = await accessByHerb();
      res.json({ ...herb, isUnlocked: true, access: access.get(herb.id) || [] });
      return;
    }

    const granted = req.player ? (await grantedHerbIds(req.player.id)).has(herb.id) : false;
    res.json(granted ? { ...herb, isUnlocked: true } : lockedStub(herb));
  } catch {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/herbs
router.post('/', requireMaster, async (req: Request, res: Response) => {
  try {
    const { name, latinName, imageUrl, rarity, discoveredAt, description, properties, effects, sortOrder } = req.body;

    const herb = await prisma.herb.create({
      data: {
        name,
        latinName: latinName || '',
        imageUrl,
        rarity: rarity || 'COMMON',
        discoveredAt,
        description,
        properties: properties || [],
        effects,
        sortOrder: sortOrder ?? 0,
      },
    });

    res.status(201).json({ ...herb, isUnlocked: true, access: [] });
  } catch {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/herbs/:id
router.put('/:id', requireMaster, async (req: Request, res: Response) => {
  try {
    const { name, latinName, imageUrl, rarity, discoveredAt, description, properties, effects, sortOrder } = req.body;

    const herb = await prisma.herb.update({
      where: { id: req.params.id },
      data: { name, latinName, imageUrl, rarity, discoveredAt, description, properties: properties || [], effects, sortOrder },
    });

    const access = await accessByHerb();
    res.json({ ...herb, isUnlocked: true, access: access.get(herb.id) || [] });
  } catch {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PATCH /api/herbs/:id/access — { playerId: slug, granted: boolean }
router.patch('/:id/access', requireMaster, async (req: Request, res: Response) => {
  try {
    const { playerId, granted } = req.body;
    const herbId = req.params.id;

    const player = await prisma.player.findUnique({ where: { slug: playerId } });
    if (!player) {
      res.status(404).json({ error: 'Игрок не найден' });
      return;
    }

    if (granted) {
      await prisma.herbAccess.upsert({
        where: { herbId_playerId: { herbId, playerId: player.id } },
        update: {},
        create: { herbId, playerId: player.id },
      });
    } else {
      await prisma.herbAccess.deleteMany({ where: { herbId, playerId: player.id } });
    }

    const access = await accessByHerb();
    res.json({ access: access.get(herbId) || [] });
  } catch {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/herbs/:id
router.delete('/:id', requireMaster, async (req: Request, res: Response) => {
  try {
    await prisma.herb.delete({ where: { id: req.params.id } });
    res.json({ message: 'Трава удалена' });
  } catch {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/herbs/:id/image
router.post('/:id/image', requireMaster, upload.single('image'), async (req: Request, res: Response) => {
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

    const access = await accessByHerb();
    res.json({ ...herb, isUnlocked: true, access: access.get(herb.id) || [] });
  } catch {
    res.status(500).json({ error: 'Ошибка загрузки файла' });
  }
});

export default router;
