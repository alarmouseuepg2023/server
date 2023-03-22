/*
  Warnings:

  - The primary key for the `device_access_control` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "device_access_control" DROP CONSTRAINT "device_access_control_pkey",
ADD CONSTRAINT "device_access_control_pkey" PRIMARY KEY ("userId", "deviceId");
