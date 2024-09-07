/*
  Warnings:

  - Added the required column `owner_email` to the `activities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_name` to the `activities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "owner_email" TEXT NOT NULL,
ADD COLUMN     "owner_name" TEXT NOT NULL;
