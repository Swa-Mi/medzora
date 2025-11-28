/*
  Warnings:

  - You are about to drop the column `diagnosis` on the `PatientRecord` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `PatientRecord` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `PatientRecord` table. All the data in the column will be lost.
  - Added the required column `age` to the `PatientRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `PatientRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `PatientRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `PatientRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PatientRecord" DROP CONSTRAINT "PatientRecord_patientId_fkey";

-- AlterTable
ALTER TABLE "PatientRecord" DROP COLUMN "diagnosis",
DROP COLUMN "patientId",
DROP COLUMN "summary",
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL;
