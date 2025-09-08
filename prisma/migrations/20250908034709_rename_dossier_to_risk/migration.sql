/*
  Warnings:

  - You are about to drop the column `dossierId` on the `Requirement` table. All the data in the column will be lost.
  - You are about to drop the `Dossier` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."RiskStatus" AS ENUM ('OPEN', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "public"."Requirement" DROP CONSTRAINT "Requirement_dossierId_fkey";

-- AlterTable
ALTER TABLE "public"."Requirement" DROP COLUMN "dossierId",
ADD COLUMN     "riskId" TEXT;

-- DropTable
DROP TABLE "public"."Dossier";

-- DropEnum
DROP TYPE "public"."DossierStatus";

-- CreateTable
CREATE TABLE "public"."Risk" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "status" "public"."RiskStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Requirement" ADD CONSTRAINT "Requirement_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "public"."Risk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
