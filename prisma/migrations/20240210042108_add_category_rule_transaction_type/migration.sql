-- AlterTable
ALTER TABLE `CategoryRule` ADD COLUMN `transactionType` ENUM('incoming', 'outgoing') NULL;
