/*
  Warnings:

  - A unique constraint covering the columns `[invitee_id,inviter_id,device_id]` on the table `invite` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "invite_invitee_id_inviter_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "invite_invitee_id_inviter_id_device_id_key" ON "invite"("invitee_id", "inviter_id", "device_id");
