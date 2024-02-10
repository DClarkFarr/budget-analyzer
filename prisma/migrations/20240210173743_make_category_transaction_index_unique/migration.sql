/*
  Warnings:

  - A unique constraint covering the columns `[categoryId,transactionId]` on the table `CategoryTransactions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `CategoryTransactions_categoryId_transactionId_idx` ON `CategoryTransactions`;

-- CreateIndex
CREATE UNIQUE INDEX `CategoryTransactions_categoryId_transactionId_key` ON `CategoryTransactions`(`categoryId`, `transactionId`);
