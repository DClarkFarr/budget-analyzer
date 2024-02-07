/*
  Warnings:

  - Added the required column `date` to the `AccountTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `AccountTransaction` ADD COLUMN `date` DATETIME(3) NOT NULL;
