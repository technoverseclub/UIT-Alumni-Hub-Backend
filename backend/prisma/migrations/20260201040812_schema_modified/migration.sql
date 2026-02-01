/*
  Warnings:

  - You are about to drop the column `role` on the `otp` table. All the data in the column will be lost.
  - Added the required column `purpose` to the `Otp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `otp` DROP COLUMN `role`,
    ADD COLUMN `isUsed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `purpose` ENUM('SIGNUP', 'LOGIN') NOT NULL;

-- CreateIndex
CREATE INDEX `Otp_email_purpose_idx` ON `Otp`(`email`, `purpose`);
