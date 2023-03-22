/*
  Warnings:

  - The primary key for the `device_access_control` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `device_access_control` table. All the data in the column will be lost.
  - Added the required column `role` to the `device_access_control` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "device_access_control" DROP CONSTRAINT "device_access_control_pkey",
DROP COLUMN "name",
ADD COLUMN     "role" VARCHAR(32) NOT NULL,
ADD CONSTRAINT "device_access_control_pkey" PRIMARY KEY ("role", "userId", "deviceId");
