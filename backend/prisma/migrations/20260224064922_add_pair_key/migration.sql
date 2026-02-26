/*
  Warnings:

  - A unique constraint covering the columns `[userPairKey]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `conversation` ADD COLUMN `userPairKey` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Conversation_userPairKey_key` ON `Conversation`(`userPairKey`);
