/*
  Warnings:

  - You are about to drop the column `qrCodeId` on the `Presence` table. All the data in the column will be lost.
  - You are about to drop the column `scanTime` on the `Presence` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,date]` on the table `Presence` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Presence" DROP CONSTRAINT "Presence_qrCodeId_fkey";

-- DropIndex
DROP INDEX "Presence_studentId_qrCodeId_key";

-- AlterTable
ALTER TABLE "Presence" DROP COLUMN "qrCodeId",
DROP COLUMN "scanTime",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Presence_studentId_date_key" ON "Presence"("studentId", "date");
