/*
  Warnings:

  - Made the column `imageUrl` on table `alumniprofile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `alumniprofile` ADD COLUMN `isComplete` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `imageUrl` VARCHAR(191) NOT NULL;
