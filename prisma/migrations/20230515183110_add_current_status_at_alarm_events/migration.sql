/*
  Warnings:

  - Added the required column `currentStatus` to the `alarm_events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "alarm_events" ADD COLUMN     "currentStatus" SMALLINT NOT NULL;
