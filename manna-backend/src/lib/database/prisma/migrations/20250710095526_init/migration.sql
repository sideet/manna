-- CreateTable
CREATE TABLE "Participation_times" (
    "no" SERIAL NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "schedule_participant_no" INTEGER NOT NULL,
    "schedule_unit_no" INTEGER NOT NULL,

    CONSTRAINT "Participation_times_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "Schedule_participants" (
    "no" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "create_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_datetime" TIMESTAMP(3) NOT NULL,
    "delete_datetime" TIMESTAMP(3) NOT NULL,
    "schedule_no" INTEGER NOT NULL,

    CONSTRAINT "Schedule_participants_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "Schedule_units" (
    "no" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "time" TIME NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "schedules_no" INTEGER NOT NULL,

    CONSTRAINT "Schedule_units_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "Schedules" (
    "no" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "introduce" VARCHAR(200) NOT NULL,
    "type" VARCHAR(500) NOT NULL,
    "is_participant_visible" BOOLEAN NOT NULL DEFAULT false,
    "is_duplicate_participation" BOOLEAN NOT NULL DEFAULT false,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "time_unit" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "code" TEXT NOT NULL,
    "create_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_datetime" TIMESTAMP(3) NOT NULL,
    "delete_datetime" TIMESTAMP(3) NOT NULL,
    "user_no" INTEGER NOT NULL,

    CONSTRAINT "Schedules_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "Users" (
    "no" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "create_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_datetime" TIMESTAMP(3) NOT NULL,
    "delete_datetime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("no")
);

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_participants_email_key" ON "Schedule_participants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
