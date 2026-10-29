-- Additive only: introduces Player/HerbAccess for personal per-player herb
-- access. The old "Herb"."isUnlocked" column is intentionally left in place —
-- it still holds the data `npm run seed` needs to backfill HerbAccess rows.
-- A follow-up migration drops it once that backfill has run in production.

-- CreateEnum
CREATE TYPE "PlayerRole" AS ENUM ('PLAYER', 'MASTER');

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "PlayerRole" NOT NULL DEFAULT 'PLAYER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HerbAccess" (
    "id" TEXT NOT NULL,
    "herbId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,

    CONSTRAINT "HerbAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_slug_key" ON "Player"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "HerbAccess_herbId_playerId_key" ON "HerbAccess"("herbId", "playerId");

-- AddForeignKey
ALTER TABLE "HerbAccess" ADD CONSTRAINT "HerbAccess_herbId_fkey" FOREIGN KEY ("herbId") REFERENCES "Herb"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HerbAccess" ADD CONSTRAINT "HerbAccess_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
