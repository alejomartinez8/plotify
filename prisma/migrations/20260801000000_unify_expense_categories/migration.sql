-- Unify expense categories to match contribution types (maintenance/works/others)
-- Migrate existing expenses that have type='general' to type='others'
UPDATE "expenses" SET "type" = 'others' WHERE "type" = 'general';

-- Remove the default value from the type column
ALTER TABLE "expenses" ALTER COLUMN "type" DROP DEFAULT;
