/*
  Warnings:

  - You are about to drop the `Majors` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Majors" DROP CONSTRAINT "Majors_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_majorsId_fkey";

-- DropTable
DROP TABLE "Majors";

-- CreateTable
CREATE TABLE "Major" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "facultyId" TEXT NOT NULL,

    CONSTRAINT "Major_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Major_name_key" ON "Major"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_majorsId_fkey" FOREIGN KEY ("majorsId") REFERENCES "Major"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Major" ADD CONSTRAINT "Major_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
