-- AlterTable
ALTER TABLE "contributions" ADD COLUMN     "receiptFileId" TEXT,
ADD COLUMN     "receiptFileName" TEXT,
ADD COLUMN     "receiptFileUrl" TEXT;

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "receiptFileId" TEXT,
ADD COLUMN     "receiptFileName" TEXT,
ADD COLUMN     "receiptFileUrl" TEXT;
