-- AddColumn
ALTER TABLE "lots" ADD COLUMN "whatsappPhone" TEXT;

-- AddColumn
ALTER TABLE "lots" ADD COLUMN "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false;
