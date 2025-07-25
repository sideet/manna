/*
  Warnings:

  - You are about to drop the `Participation_times` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Schedule_participants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Schedule_units` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Schedules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Participation_times" DROP CONSTRAINT "Participation_times_schedule_participant_no_fkey";

-- DropForeignKey
ALTER TABLE "Participation_times" DROP CONSTRAINT "Participation_times_schedule_unit_no_fkey";

-- DropForeignKey
ALTER TABLE "Schedule_participants" DROP CONSTRAINT "Schedule_participants_schedule_no_fkey";

-- DropForeignKey
ALTER TABLE "Schedule_units" DROP CONSTRAINT "Schedule_units_schedule_no_fkey";

-- DropForeignKey
ALTER TABLE "Schedules" DROP CONSTRAINT "Schedules_user_no_fkey";

-- DropTable
DROP TABLE "Participation_times";

-- DropTable
DROP TABLE "Schedule_participants";

-- DropTable
DROP TABLE "Schedule_units";

-- DropTable
DROP TABLE "Schedules";

-- DropTable
DROP TABLE "Users";

-- CreateTable
CREATE TABLE "participation_times" (
    "no" SERIAL NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "schedule_participant_no" INTEGER NOT NULL,
    "schedule_unit_no" INTEGER NOT NULL,
    "create_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_datetime" TIMESTAMP(3) NOT NULL,
    "delete_datetime" TIMESTAMP(3),

    CONSTRAINT "participation_times_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "schedule_participants" (
    "no" SERIAL NOT NULL,
    "email" VARCHAR(30),
    "name" VARCHAR(30) NOT NULL,
    "phone" VARCHAR(30),
    "memo" VARCHAR(300),
    "create_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_datetime" TIMESTAMP(3) NOT NULL,
    "delete_datetime" TIMESTAMP(3),
    "schedule_no" INTEGER NOT NULL,

    CONSTRAINT "schedule_participants_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "schedule_units" (
    "no" SERIAL NOT NULL,
    "date" VARCHAR(50) NOT NULL,
    "time" VARCHAR(50),
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "schedule_no" INTEGER NOT NULL,

    CONSTRAINT "schedule_units_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "schedules" (
    "no" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(200),
    "type" VARCHAR(500) NOT NULL,
    "is_participant_visible" BOOLEAN NOT NULL DEFAULT false,
    "is_duplicate_participation" BOOLEAN NOT NULL DEFAULT false,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "time_unit" VARCHAR(10) NOT NULL,
    "time" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "code" VARCHAR(20),
    "create_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_datetime" TIMESTAMP(3) NOT NULL,
    "delete_datetime" TIMESTAMP(3),
    "user_no" INTEGER NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "users" (
    "no" SERIAL NOT NULL,
    "email" VARCHAR(30) NOT NULL,
    "password" VARCHAR(30) NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "nickname" VARCHAR(30),
    "phone" VARCHAR(30) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "create_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_datetime" TIMESTAMP(3) NOT NULL,
    "delete_datetime" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("no")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "participation_times" ADD CONSTRAINT "participation_times_schedule_participant_no_fkey" FOREIGN KEY ("schedule_participant_no") REFERENCES "schedule_participants"("no") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "participation_times" ADD CONSTRAINT "participation_times_schedule_unit_no_fkey" FOREIGN KEY ("schedule_unit_no") REFERENCES "schedule_units"("no") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_participants" ADD CONSTRAINT "schedule_participants_schedule_no_fkey" FOREIGN KEY ("schedule_no") REFERENCES "schedules"("no") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_units" ADD CONSTRAINT "schedule_units_schedule_no_fkey" FOREIGN KEY ("schedule_no") REFERENCES "schedules"("no") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_user_no_fkey" FOREIGN KEY ("user_no") REFERENCES "users"("no") ON DELETE NO ACTION ON UPDATE NO ACTION;
