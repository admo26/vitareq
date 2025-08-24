/*
  Warnings:

  - A unique constraint covering the columns `[requirementNumber]` on the table `Requirement` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Requirement" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "owner" TEXT,
ADD COLUMN     "requirementNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Requirement_requirementNumber_key" ON "public"."Requirement"("requirementNumber");
