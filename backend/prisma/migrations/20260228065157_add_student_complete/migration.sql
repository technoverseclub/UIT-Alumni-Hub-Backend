-- AlterTable
ALTER TABLE `studentprofile` ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `isComplete` BOOLEAN NOT NULL DEFAULT false;
