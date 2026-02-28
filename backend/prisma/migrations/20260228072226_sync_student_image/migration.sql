/*
  Warnings:

  - Made the column `imageUrl` on table `studentprofile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `studentprofile` MODIFY `imageUrl` VARCHAR(191) NOT NULL;
