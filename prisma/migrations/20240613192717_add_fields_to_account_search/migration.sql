-- AlterTable
ALTER TABLE `AccountSearch` ADD COLUMN `endAt` DATETIME(3) NULL,
    ADD COLUMN `excludeIds` VARCHAR(191) NULL DEFAULT '[]',
    ADD COLUMN `startAt` DATETIME(3) NULL;
