import { PrismaClient, Player } from '@prisma/client';
import bcrypt from 'bcryptjs';

const PLAYER_DEFS = [
  { slug: 'velimir', name: 'Велимир', envVar: 'PLAYER_VELIMIR_PASSWORD', role: 'PLAYER' as const },
  { slug: 'midsommar', name: 'Мидсоммар', envVar: 'PLAYER_MIDSOMMAR_PASSWORD', role: 'PLAYER' as const },
  { slug: 'leiv', name: 'Лейв', envVar: 'PLAYER_LEIV_PASSWORD', role: 'PLAYER' as const },
  { slug: 'belogor', name: 'Белогор', envVar: 'PLAYER_BELOGOR_PASSWORD', role: 'PLAYER' as const },
  { slug: 'master', name: 'Мастер Подземелий', envVar: 'MASTER_PASSWORD', role: 'MASTER' as const },
];

export async function upsertPlayers(prisma: PrismaClient): Promise<Player[]> {
  const players: Player[] = [];
  for (const def of PLAYER_DEFS) {
    const password = process.env[def.envVar];
    if (!password) {
      throw new Error(`Не задан ${def.envVar} в server/.env — нужен пароль для игрока «${def.name}»`);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const player = await prisma.player.upsert({
      where: { slug: def.slug },
      update: { name: def.name, passwordHash, role: def.role },
      create: { slug: def.slug, name: def.name, passwordHash, role: def.role },
    });
    players.push(player);
  }
  return players;
}
