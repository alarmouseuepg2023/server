/*
  Warnings:

  - You are about to drop the `guest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "guest" DROP CONSTRAINT "guest_device_id_fkey";

-- DropForeignKey
ALTER TABLE "guest" DROP CONSTRAINT "guest_user_id_fkey";

-- DropTable
DROP TABLE "guest";
