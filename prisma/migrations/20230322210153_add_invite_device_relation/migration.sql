/*
  Warnings:

  - Added the required column `deviceId` to the `invite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invite" ADD COLUMN     "deviceId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
