-- CreateTable
CREATE TABLE "other_incomes" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptNumber" TEXT,
    "receiptFileId" TEXT,
    "receiptFileName" TEXT,
    "receiptFileUrl" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
    "approvalNote" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "other_incomes_pkey" PRIMARY KEY ("id")
);

-- Data migration: move contributions recorded under the "N/A" placeholder
-- lot (pre-app historical income and standalone control sales that were
-- never tied to a real lot) into other_incomes, then remove that lot so it
-- stops surfacing as a fake lot in reports.
INSERT INTO "other_incomes" ("type", "amount", "description", "date", "receiptNumber", "receiptFileId", "receiptFileName", "receiptFileUrl", "approvalStatus", "approvalNote", "approvedBy", "approvedAt")
SELECT c."type", c."amount", c."description", c."date", c."receiptNumber", c."receiptFileId", c."receiptFileName", c."receiptFileUrl", c."approvalStatus", c."approvalNote", c."approvedBy", c."approvedAt"
FROM "contributions" c
JOIN "lots" l ON l."id" = c."lotId"
WHERE l."lotNumber" = 'N/A';

DELETE FROM "contributions"
WHERE "lotId" IN (SELECT "id" FROM "lots" WHERE "lotNumber" = 'N/A');

DELETE FROM "lots" WHERE "lotNumber" = 'N/A';

-- AlterTable: drop the lot exemption feature (only the "N/A" placeholder
-- lot ever used it, and it no longer exists after the migration above)
ALTER TABLE "lots" DROP COLUMN "isExempt",
DROP COLUMN "exemptionReason",
DROP COLUMN "exemptionEndDate";
