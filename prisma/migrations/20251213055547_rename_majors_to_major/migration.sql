/*
  Warnings:

  - You are about to drop the column `majorsId` on the `User` table. All the data in the column will be lost.
  - Made the column `enrollmentYear` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `graduationYear` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_majorsId_fkey";

-- DropIndex
DROP INDEX "User_majorsId_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "majorsId",
ADD COLUMN     "majorId" TEXT,
ALTER COLUMN "enrollmentYear" SET NOT NULL,
ALTER COLUMN "graduationYear" SET NOT NULL;

-- CreateIndex
CREATE INDEX "User_majorId_idx" ON "User"("majorId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "Major"("id") ON DELETE SET NULL ON UPDATE CASCADE;
