-- Data fix: the previous migration's backfill (20260828130000) marked
-- every pre-existing contribution/expense as 'approved' so the
-- Treasurer's queue wouldn't start with a massive backlog. On review,
-- the decision changed: everything should start 'pending' so the
-- Treasurer actually reviews the full historical ledger too.
--
-- Guarded by "approvedBy" IS NULL so this only ever touches backfilled
-- rows (never a record a real Treasurer already approved/rejected) —
-- pure data update, no rows added or removed.
UPDATE "contributions"
SET "approvalStatus" = 'pending'
WHERE "approvalStatus" = 'approved' AND "approvedBy" IS NULL;

UPDATE "expenses"
SET "approvalStatus" = 'pending'
WHERE "approvalStatus" = 'approved' AND "approvedBy" IS NULL;
