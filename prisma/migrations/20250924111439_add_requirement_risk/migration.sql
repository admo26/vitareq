-- CreateEnum
CREATE TYPE "public"."RequirementRisk" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "public"."Requirement" ADD COLUMN     "riskLevel" "public"."RequirementRisk" NOT NULL DEFAULT 'MEDIUM';
