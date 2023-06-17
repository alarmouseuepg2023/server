-- CreateTable
CREATE TABLE "push_notifications" (
    "user_id" UUID NOT NULL,
    "fcm_token" VARCHAR(255) NOT NULL,
    "notification_enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "push_notifications_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "push_notifications" ADD CONSTRAINT "push_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
