-- Rename LEGENDARY → VERY_RARE in Rarity enum

-- Step 1: Add VERY_RARE to the existing enum (PostgreSQL allows adding values)
ALTER TYPE "Rarity" ADD VALUE 'VERY_RARE';

-- Step 2: Update all existing rows that use LEGENDARY
UPDATE "Herb" SET rarity = 'VERY_RARE' WHERE rarity = 'LEGENDARY';

-- Step 3: Recreate the enum without LEGENDARY
CREATE TYPE "Rarity_new" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'VERY_RARE');

-- Step 4: Drop the column default (it references the old enum type)
ALTER TABLE "Herb" ALTER COLUMN "rarity" DROP DEFAULT;

-- Step 5: Cast the column to the new enum type
ALTER TABLE "Herb" ALTER COLUMN "rarity" TYPE "Rarity_new" USING rarity::text::"Rarity_new";

-- Step 6: Swap type names
ALTER TYPE "Rarity" RENAME TO "Rarity_old";
ALTER TYPE "Rarity_new" RENAME TO "Rarity";
DROP TYPE "Rarity_old";

-- Step 7: Restore the default
ALTER TABLE "Herb" ALTER COLUMN "rarity" SET DEFAULT 'COMMON'::"Rarity";
