/**
 * Одноразовый прод-скрипт: создаёт игроков и переносит старый общий флаг
 * Herb.isUnlocked в персональные HerbAccess (открывает ранее разблокированные
 * травы всем игрокам). В отличие от seed.ts НЕ трогает существующие травы.
 * Запуск: npx ts-node prisma/migrate-access.ts (после деплоя миграции
 * 20260624120000_player_access_model, до того как колонка isUnlocked будет
 * удалена следующей миграцией).
 */
import { PrismaClient } from '@prisma/client';
import { upsertPlayers } from './players';

const prisma = new PrismaClient();

async function main() {
  const players = await upsertPlayers(prisma);
  console.log(`✓ Игроки созданы/обновлены: ${players.map((p) => p.name).join(', ')}`);

  const playerIds = players.filter((p) => p.role === 'PLAYER').map((p) => p.id);
  const unlockedHerbs: { id: string }[] = await prisma.$queryRaw`SELECT "id" FROM "Herb" WHERE "isUnlocked" = true`;

  for (const herb of unlockedHerbs) {
    await prisma.herbAccess.createMany({
      data: playerIds.map((playerId) => ({ herbId: herb.id, playerId })),
      skipDuplicates: true,
    });
  }
  console.log(`✓ Доступ перенесён для ${unlockedHerbs.length} ранее открытых трав`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
