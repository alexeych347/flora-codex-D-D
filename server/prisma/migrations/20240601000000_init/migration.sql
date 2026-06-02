-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY');

-- CreateTable
CREATE TABLE "Herb" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latinName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "rarity" "Rarity" NOT NULL DEFAULT 'COMMON',
    "discoveredAt" TEXT,
    "description" TEXT NOT NULL,
    "properties" TEXT[],
    "effects" TEXT NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Herb_pkey" PRIMARY KEY ("id")
);
