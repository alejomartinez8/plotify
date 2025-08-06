-- AddColumn
ALTER TABLE "lots" ADD COLUMN "isExempt" BOOLEAN NOT NULL DEFAULT false;

-- AddColumn
ALTER TABLE "lots" ADD COLUMN "exemptionReason" TEXT;