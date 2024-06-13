-- DropForeignKey
ALTER TABLE `Account` DROP FOREIGN KEY `Account_userId_fkey`;

-- DropForeignKey
ALTER TABLE `AccountTransaction` DROP FOREIGN KEY `AccountTransaction_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `AccountTransaction` DROP FOREIGN KEY `AccountTransaction_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Category` DROP FOREIGN KEY `Category_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `Category` DROP FOREIGN KEY `Category_userId_fkey`;

-- DropForeignKey
ALTER TABLE `CategoryRule` DROP FOREIGN KEY `CategoryRule_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `CategoryRule` DROP FOREIGN KEY `CategoryRule_userId_fkey`;

-- DropForeignKey
ALTER TABLE `CategoryTransactions` DROP FOREIGN KEY `CategoryTransactions_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `CategoryTransactions` DROP FOREIGN KEY `CategoryTransactions_transactionId_fkey`;

-- CreateTable
CREATE TABLE `AccountSearch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `accountId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AccountSearch_userId_idx`(`userId`),
    INDEX `AccountSearch_accountId_idx`(`accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountTransaction` ADD CONSTRAINT `AccountTransaction_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountTransaction` ADD CONSTRAINT `AccountTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoryTransactions` ADD CONSTRAINT `CategoryTransactions_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoryTransactions` ADD CONSTRAINT `CategoryTransactions_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `AccountTransaction`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoryRule` ADD CONSTRAINT `CategoryRule_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoryRule` ADD CONSTRAINT `CategoryRule_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountSearch` ADD CONSTRAINT `AccountSearch_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountSearch` ADD CONSTRAINT `AccountSearch_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
