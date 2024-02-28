-- AlterTable
ALTER TABLE `AccountTransaction` MODIFY `bankType` ENUM('wells_fargo', 'venmo', 'afcu') NOT NULL;
