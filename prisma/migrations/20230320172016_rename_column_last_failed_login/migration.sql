/*
  Warnings:

  - You are about to drop the column `last_failed_login` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "last_failed_login",
ADD COLUMN     "last_failed_login_date" TIMESTAMP;
