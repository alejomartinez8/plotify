-- Replaces the old isExempt/exemptionReason/exemptionEndDate combo with a
-- single date: the point from which a lot starts owing maintenance quotas.
-- Works quotas are unaffected — they're gated only by stage and due date.
ALTER TABLE "lots" ADD COLUMN "maintenanceActiveFrom" TIMESTAMP(3);
