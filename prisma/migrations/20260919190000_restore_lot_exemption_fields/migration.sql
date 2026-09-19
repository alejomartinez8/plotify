-- Restore the lot exemption feature. It was removed under the assumption
-- that only the placeholder "N/A" lot used it, but real lots (e.g.
-- negotiated Stage 2 arrangements) also relied on it, and their
-- isExempt/exemptionReason/exemptionEndDate values were lost when the
-- columns were dropped. This re-adds the columns (empty) so that data can
-- be re-entered manually per lot.
ALTER TABLE "lots" ADD COLUMN "isExempt" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "lots" ADD COLUMN "exemptionReason" TEXT;
ALTER TABLE "lots" ADD COLUMN "exemptionEndDate" TIMESTAMP(3);
