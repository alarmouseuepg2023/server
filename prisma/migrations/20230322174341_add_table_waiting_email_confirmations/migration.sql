-- CreateTable
CREATE TABLE "waiting_email_confirmations" (
    "pin" VARCHAR(100) NOT NULL,
    "expires_in" TIMESTAMP NOT NULL,
    "operation" SMALLINT NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "waiting_email_confirmations_pkey" PRIMARY KEY ("userId","operation")
);

-- AddForeignKey
ALTER TABLE "waiting_email_confirmations" ADD CONSTRAINT "waiting_email_confirmations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
