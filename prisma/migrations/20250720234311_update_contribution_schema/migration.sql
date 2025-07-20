/*
  Warnings:

  - You are about to drop the column `month` on the `contributions` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `contributions` table. All the data in the column will be lost.
  - The `date` column on the `contributions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "contributions" DROP COLUMN "month",
DROP COLUMN "year",
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
