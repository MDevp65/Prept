/*
  Warnings:

  - You are about to drop the column `processedBy` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payout" ADD COLUMN     "processedBy" TEXT;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "processedBy";
