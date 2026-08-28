-- AlterTable: approval workflow fields on contributions
ALTER TABLE "contributions"
  ADD COLUMN "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN "approvalNote"   TEXT,
  ADD COLUMN "approvedBy"     TEXT,
  ADD COLUMN "approvedAt"     TIMESTAMP(3);

-- AlterTable: approval workflow fields on expenses
ALTER TABLE "expenses"
  ADD COLUMN "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN "approvalNote"   TEXT,
  ADD COLUMN "approvedBy"     TEXT,
  ADD COLUMN "approvedAt"     TIMESTAMP(3);

-- CreateTable: treasurers (email whitelist)
CREATE TABLE "treasurers" (
  "id"        TEXT NOT NULL,
  "email"     TEXT NOT NULL,
  "name"      TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "treasurers_pkey" PRIMARY KEY ("id")
);

-- CreateTable: approval_history (audit trail)
CREATE TABLE "approval_history" (
  "id"             TEXT NOT NULL,
  "recordType"     TEXT NOT NULL,
  "recordId"       INTEGER NOT NULL,
  "action"         TEXT NOT NULL,
  "treasurerEmail" TEXT NOT NULL,
  "note"           TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "approval_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "treasurers_email_key"
  ON "treasurers"("email");

-- CreateIndex
CREATE INDEX "approval_history_recordType_recordId_idx"
  ON "approval_history"("recordType", "recordId");

-- Backfill: records created before this feature shipped are treated as
-- already approved, so the Treasurer's review queue starts empty instead
-- of retroactively flagging the entire historical ledger as pending.
UPDATE "contributions" SET "approvalStatus" = 'approved';
UPDATE "expenses"      SET "approvalStatus" = 'approved';
