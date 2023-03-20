-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "login_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_failed_login" TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device" (
    "id" UUID NOT NULL,
    "mac_address" VARCHAR(12) NOT NULL,
    "owner_password" VARCHAR(100) NOT NULL,
    "nickname" VARCHAR(32) NOT NULL,
    "wifi_ssid" VARCHAR(32) NOT NULL,
    "wifi_password" VARCHAR(100) NOT NULL,
    "status" SMALLINT NOT NULL,
    "owner_id" UUID NOT NULL,

    CONSTRAINT "device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest" (
    "unlock_attempts" INTEGER NOT NULL DEFAULT 0,
    "password" VARCHAR(100) NOT NULL,
    "last_failed_unlock" TIMESTAMP,
    "userId" UUID NOT NULL,
    "deviceId" UUID NOT NULL,

    CONSTRAINT "guest_pkey" PRIMARY KEY ("userId","deviceId")
);

-- CreateTable
CREATE TABLE "alarm_events" (
    "id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL,
    "deviceId" UUID NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "alarm_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite" (
    "id" UUID NOT NULL,
    "status" SMALLINT NOT NULL,
    "token" VARCHAR(40) NOT NULL,
    "invited_at" TIMESTAMP NOT NULL,
    "answered_at" TIMESTAMP,
    "inviteeId" UUID NOT NULL,
    "inviterId" UUID NOT NULL,

    CONSTRAINT "invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "name" VARCHAR(32) NOT NULL,
    "userId" UUID NOT NULL,
    "deviceId" UUID NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("name","userId","deviceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "device_mac_address_key" ON "device"("mac_address");

-- CreateIndex
CREATE UNIQUE INDEX "invite_inviteeId_inviterId_key" ON "invite"("inviteeId", "inviterId");

-- AddForeignKey
ALTER TABLE "device" ADD CONSTRAINT "device_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest" ADD CONSTRAINT "guest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest" ADD CONSTRAINT "guest_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alarm_events" ADD CONSTRAINT "alarm_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alarm_events" ADD CONSTRAINT "alarm_events_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
