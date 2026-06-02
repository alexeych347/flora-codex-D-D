-- PostgreSQL does not allow using a newly added enum value in the same
-- transaction where it was added (error 55P04). We split into two transactions
-- via an explicit COMMIT so Prisma's outer transaction ends after ADD VALUE.

-- Transaction 1: add the new enum value and commit immediately.
ALTER TYPE "Rarity" ADD VALUE IF NOT EXISTS 'VERY_RARE';

COMMIT;

-- Transaction 2: now VERY_RARE is visible — use it, then rebuild the enum
-- without LEGENDARY.
UPDATE "Herb" SET rarity = 'VERY_RARE' WHERE rarity = 'LEGENDARY';

DROP TYPE IF EXISTS "Rarity_new";
CREATE TYPE "Rarity_new" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'VERY_RARE');

ALTER TABLE "Herb" ALTER COLUMN "rarity" DROP DEFAULT;
ALTER TABLE "Herb" ALTER COLUMN "rarity" TYPE "Rarity_new" USING rarity::text::"Rarity_new";

ALTER TYPE "Rarity" RENAME TO "Rarity_old";
ALTER TYPE "Rarity_new" RENAME TO "Rarity";
DROP TYPE "Rarity_old";

ALTER TABLE "Herb" ALTER COLUMN "rarity" SET DEFAULT 'COMMON'::"Rarity";
