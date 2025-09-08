-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."RequirementStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "public"."RequirementStatus" ADD VALUE 'TO_DO';
ALTER TYPE "public"."RequirementStatus" ADD VALUE 'DONE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."RiskStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "public"."RiskStatus" ADD VALUE 'TO_DO';
ALTER TYPE "public"."RiskStatus" ADD VALUE 'DONE';
