/*
  Warnings:

  - Added the required column `expirationTime` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "expirationTime" INTEGER NOT NULL;
