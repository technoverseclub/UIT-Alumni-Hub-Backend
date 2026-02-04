/*
  Warnings:

  - You are about to drop the column `graduationYear` on the `alumniprofile` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `user` table. All the data in the column will be lost.
  - Added the required column `batch` to the `AlumniProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branch` to the `AlumniProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `AlumniProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `alumniprofile` DROP COLUMN `graduationYear`,
    ADD COLUMN `batch` INTEGER NOT NULL,
    ADD COLUMN `branch` VARCHAR(191) NOT NULL,
    ADD COLUMN `linkedin` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `phone`;
