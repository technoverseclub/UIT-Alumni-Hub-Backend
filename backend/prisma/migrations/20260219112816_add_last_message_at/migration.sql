-- AlterTable
ALTER TABLE `conversation` ADD COLUMN `lastMessageAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Conversation_lastMessageAt_idx` ON `Conversation`(`lastMessageAt`);
