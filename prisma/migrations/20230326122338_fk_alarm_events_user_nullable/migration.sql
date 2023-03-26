-- DropForeignKey
ALTER TABLE "alarm_events" DROP CONSTRAINT "alarm_events_user_id_fkey";

-- AlterTable
ALTER TABLE "alarm_events" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "alarm_events" ADD CONSTRAINT "alarm_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
