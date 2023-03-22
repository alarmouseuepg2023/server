/*
  Warnings:

  - You are about to drop the column `owner_password` on the `device` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `guest` table. All the data in the column will be lost.
  - You are about to drop the `role` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "role" DROP CONSTRAINT "role_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "role" DROP CONSTRAINT "role_userId_fkey";

-- AlterTable
ALTER TABLE "device" DROP COLUMN "owner_password";

-- AlterTable
ALTER TABLE "guest" DROP COLUMN "password";

-- DropTable
DROP TABLE "role";

-- CreateTable
CREATE TABLE "device_access_control" (
    "name" VARCHAR(32) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "userId" UUID NOT NULL,
    "deviceId" UUID NOT NULL,

    CONSTRAINT "device_access_control_pkey" PRIMARY KEY ("name","userId","deviceId")
);

-- AddForeignKey
ALTER TABLE "device_access_control" ADD CONSTRAINT "device_access_control_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_access_control" ADD CONSTRAINT "device_access_control_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
