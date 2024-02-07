-- CreateTable
CREATE TABLE `AccountTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `expenseType` ENUM('incoming', 'outgoing') NOT NULL,
    `bankType` ENUM('wells_fargo', 'venmo') NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `hash` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `AccountTransaction_hash_key`(`hash`),
    INDEX `AccountTransaction_accountId_idx`(`accountId`),
    INDEX `AccountTransaction_userId_idx`(`userId`),
    INDEX `AccountTransaction_accountId_userId_idx`(`accountId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccountTransaction` ADD CONSTRAINT `AccountTransaction_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountTransaction` ADD CONSTRAINT `AccountTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Account` RENAME INDEX `Account_userId_fkey` TO `Account_userId_idx`;
