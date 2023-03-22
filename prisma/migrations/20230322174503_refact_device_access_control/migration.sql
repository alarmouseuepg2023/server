/*
  Warnings:

  - You are about to drop the column `last_failed_unlock` on the `guest` table. All the data in the column will be lost.
  - You are about to drop the column `unlock_attempts` on the `guest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "device_access_control" ADD COLUMN     "last_failed_unlock" TIMESTAMP,
ADD COLUMN     "unlock_attempts" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "guest" DROP COLUMN "last_failed_unlock",
DROP COLUMN "unlock_attempts";
