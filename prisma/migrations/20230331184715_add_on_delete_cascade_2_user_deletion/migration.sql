-- DropForeignKey
ALTER TABLE "alarm_events" DROP CONSTRAINT "alarm_events_device_id_fkey";

-- DropForeignKey
ALTER TABLE "alarm_events" DROP CONSTRAINT "alarm_events_user_id_fkey";

-- DropForeignKey
ALTER TABLE "device_access_control" DROP CONSTRAINT "device_access_control_device_id_fkey";

-- DropForeignKey
ALTER TABLE "device_access_control" DROP CONSTRAINT "device_access_control_user_id_fkey";

-- DropForeignKey
ALTER TABLE "invite" DROP CONSTRAINT "invite_device_id_fkey";

-- DropForeignKey
ALTER TABLE "invite" DROP CONSTRAINT "invite_invitee_id_fkey";

-- DropForeignKey
ALTER TABLE "invite" DROP CONSTRAINT "invite_inviter_id_fkey";

-- AddForeignKey
ALTER TABLE "alarm_events" ADD CONSTRAINT "alarm_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alarm_events" ADD CONSTRAINT "alarm_events_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_access_control" ADD CONSTRAINT "device_access_control_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_access_control" ADD CONSTRAINT "device_access_control_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
