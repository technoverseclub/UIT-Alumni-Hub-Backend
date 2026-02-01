/*
  Warnings:

  - You are about to drop the `otpcode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `otpcode` DROP FOREIGN KEY `OtpCode_userId_fkey`;

-- DropTable
DROP TABLE `otpcode`;
