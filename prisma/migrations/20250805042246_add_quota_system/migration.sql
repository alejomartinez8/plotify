-- AlterTable
ALTER TABLE "expenses" ALTER COLUMN "type" SET DEFAULT 'general';

-- AlterTable
ALTER TABLE "lots" ADD COLUMN     "initialWorksDebt" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "quota_configs" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "quotaType" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quota_configs_pkey" PRIMARY KEY ("id")
);
