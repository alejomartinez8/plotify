-- AlterTable
ALTER TABLE "lots" ADD COLUMN     "stage" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "quota_configs" ADD COLUMN     "stages" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- Preserve current behavior: existing "works" quotas applied to every lot
-- regardless of stage, so backfill them to cover both stages. Newly
-- created works quotas must explicitly pick which stage(s) they apply to.
UPDATE "quota_configs" SET "stages" = ARRAY[1, 2] WHERE "quotaType" = 'works';
