/*
  Warnings:

  - You are about to drop the column `deviceId` on the `alarm_events` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `alarm_events` table. All the data in the column will be lost.
  - The primary key for the `device_access_control` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deviceId` on the `device_access_control` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `device_access_control` table. All the data in the column will be lost.
  - The primary key for the `guest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deviceId` on the `guest` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `guest` table. All the data in the column will be lost.
  - You are about to drop the column `deviceId` on the `invite` table. All the data in the column will be lost.
  - You are about to drop the column `inviteeId` on the `invite` table. All the data in the column will be lost.
  - You are about to drop the column `inviterId` on the `invite` table. All the data in the column will be lost.
  - The primary key for the `waiting_email_confirmations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `waiting_email_confirmations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[invitee_id,inviter_id]` on the table `invite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `device_id` to the `alarm_events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `alarm_events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `device_id` to the `device_access_control` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `device_access_control` table without a default value. This is not possible if the table is not empty.
  - Added the required column `device_id` to the `guest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `guest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `device_id` to the `invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invitee_id` to the `invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inviter_id` to the `invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `waiting_email_confirmations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "alarm_events" DROP CONSTRAINT "alarm_events_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "alarm_events" DROP CONSTRAINT "alarm_events_userId_fkey";

-- DropForeignKey
ALTER TABLE "device_access_control" DROP CONSTRAINT "device_access_control_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "device_access_control" DROP CONSTRAINT "device_access_control_userId_fkey";

-- DropForeignKey
ALTER TABLE "guest" DROP CONSTRAINT "guest_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "guest" DROP CONSTRAINT "guest_userId_fkey";

-- DropForeignKey
ALTER TABLE "invite" DROP CONSTRAINT "invite_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "invite" DROP CONSTRAINT "invite_inviteeId_fkey";

-- DropForeignKey
ALTER TABLE "invite" DROP CONSTRAINT "invite_inviterId_fkey";

-- DropForeignKey
ALTER TABLE "waiting_email_confirmations" DROP CONSTRAINT "waiting_email_confirmations_userId_fkey";

-- DropIndex
DROP INDEX "invite_inviteeId_inviterId_key";

-- AlterTable
ALTER TABLE "alarm_events" DROP COLUMN "deviceId",
DROP COLUMN "userId",
ADD COLUMN     "device_id" UUID NOT NULL,
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "device_access_control" DROP CONSTRAINT "device_access_control_pkey",
DROP COLUMN "deviceId",
DROP COLUMN "userId",
ADD COLUMN     "device_id" UUID NOT NULL,
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "device_access_control_pkey" PRIMARY KEY ("user_id", "device_id");

-- AlterTable
ALTER TABLE "guest" DROP CONSTRAINT "guest_pkey",
DROP COLUMN "deviceId",
DROP COLUMN "userId",
ADD COLUMN     "device_id" UUID NOT NULL,
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "guest_pkey" PRIMARY KEY ("user_id", "device_id");

-- AlterTable
ALTER TABLE "invite" DROP COLUMN "deviceId",
DROP COLUMN "inviteeId",
DROP COLUMN "inviterId",
ADD COLUMN     "device_id" UUID NOT NULL,
ADD COLUMN     "invitee_id" UUID NOT NULL,
ADD COLUMN     "inviter_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "waiting_email_confirmations" DROP CONSTRAINT "waiting_email_confirmations_pkey",
DROP COLUMN "userId",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "waiting_email_confirmations_pkey" PRIMARY KEY ("user_id", "operation");

-- CreateIndex
CREATE UNIQUE INDEX "invite_invitee_id_inviter_id_key" ON "invite"("invitee_id", "inviter_id");

-- AddForeignKey
ALTER TABLE "waiting_email_confirmations" ADD CONSTRAINT "waiting_email_confirmations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest" ADD CONSTRAINT "guest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest" ADD CONSTRAINT "guest_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alarm_events" ADD CONSTRAINT "alarm_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alarm_events" ADD CONSTRAINT "alarm_events_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_access_control" ADD CONSTRAINT "device_access_control_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_access_control" ADD CONSTRAINT "device_access_control_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
