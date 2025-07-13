-- CreateTable
CREATE TABLE "Participation_times" (
    "no" SERIAL NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "schedule_participant_no" INTEGER NOT NULL,
    "schedule_unit_no" INTEGER NOT NULL,
    "create_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_datetime" TIMESTAMP(3) NOT NULL,
    "delete_datetime" TIMESTAMP(3),

    CONSTRAINT "Participation_times_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "Schedule_participants" (
    "no" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "memo" TEXT,
    "create_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_datetime" TIMESTAMP(3) NOT NULL,
    "delete_datetime" TIMESTAMP(3),
    "schedule_no" INTEGER NOT NULL,

    CONSTRAINT "Schedule_participants_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "Schedule_units" (
    "no" SERIAL NOT NULL,
    "date" VARCHAR(50) NOT NULL,
    "time" VARCHAR(50),
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "schedule_no" INTEGER NOT NULL,

    CONSTRAINT "Schedule_units_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "Schedules" (
    "no" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(200),
    "type" VARCHAR(500) NOT NULL,
    "is_participant_visible" BOOLEAN NOT NULL DEFAULT false,
    "is_duplicate_participation" BOOLEAN NOT NULL DEFAULT false,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "time_unit" TEXT NOT NULL,
    "time" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "code" TEXT,
    "create_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_datetime" TIMESTAMP(3) NOT NULL,
    "delete_datetime" TIMESTAMP(3),
    "user_no" INTEGER NOT NULL,

    CONSTRAINT "Schedules_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "Users" (
    "no" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "phone" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "create_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_datetime" TIMESTAMP(3) NOT NULL,
    "delete_datetime" TIMESTAMP(3),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("no")
);

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_participants_email_key" ON "Schedule_participants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Participation_times" ADD CONSTRAINT "Participation_times_schedule_participant_no_fkey" FOREIGN KEY ("schedule_participant_no") REFERENCES "Schedule_participants"("no") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Participation_times" ADD CONSTRAINT "Participation_times_schedule_unit_no_fkey" FOREIGN KEY ("schedule_unit_no") REFERENCES "Schedule_units"("no") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Schedule_participants" ADD CONSTRAINT "Schedule_participants_schedule_no_fkey" FOREIGN KEY ("schedule_no") REFERENCES "Schedules"("no") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Schedule_units" ADD CONSTRAINT "Schedule_units_schedule_no_fkey" FOREIGN KEY ("schedule_no") REFERENCES "Schedules"("no") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Schedules" ADD CONSTRAINT "Schedules_user_no_fkey" FOREIGN KEY ("user_no") REFERENCES "Users"("no") ON DELETE NO ACTION ON UPDATE NO ACTION;
