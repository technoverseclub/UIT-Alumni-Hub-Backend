/*
  Warnings:

  - Added the required column `name` to the `Otp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Otp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `otp` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `role` ENUM('STUDENT', 'ALUMNI') NOT NULL;
