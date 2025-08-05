-- AlterTable
ALTER TABLE "lots" ADD COLUMN     "initialWorksDebt" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "quota_configs" (
    "id" TEXT NOT NULL,
    "quotaType" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),

    CONSTRAINT "quota_configs_pkey" PRIMARY KEY ("id")
);
