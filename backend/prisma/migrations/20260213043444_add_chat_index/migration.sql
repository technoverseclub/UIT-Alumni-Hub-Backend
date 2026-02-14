-- CreateIndex
CREATE INDEX `ConversationParticipant_conversationId_idx` ON `ConversationParticipant`(`conversationId`);

-- RenameIndex
ALTER TABLE `conversationparticipant` RENAME INDEX `ConversationParticipant_userId_fkey` TO `ConversationParticipant_userId_idx`;

-- RenameIndex
ALTER TABLE `message` RENAME INDEX `Message_conversationId_fkey` TO `Message_conversationId_idx`;

-- RenameIndex
ALTER TABLE `message` RENAME INDEX `Message_senderId_fkey` TO `Message_senderId_idx`;
