-- CreateTable
CREATE TABLE "participation_times" (
    "no" SERIAL NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "schedule_participant_no" INTEGER NOT NULL,
    "schedule_unit_no" INTEGER NOT NULL,
    "create_datetime" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_datetime" TIMESTAMP(6),
    "delete_datetime" TIMESTAMP(3),

    CONSTRAINT "participation_times_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "schedule_participants" (
    "no" SERIAL NOT NULL,
    "email" VARCHAR(100),
    "name" VARCHAR(30) NOT NULL,
    "phone" VARCHAR(100),
    "memo" VARCHAR(300),
    "create_datetime" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_datetime" TIMESTAMP(6),
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
    "meeting_type" VARCHAR(100) NOT NULL,
    "is_participant_visible" BOOLEAN NOT NULL DEFAULT false,
    "is_duplicate_participation" BOOLEAN NOT NULL DEFAULT false,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "time_unit" VARCHAR(10) NOT NULL,
    "time" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "code" VARCHAR(20),
    "create_datetime" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_datetime" TIMESTAMP(6),
    "delete_datetime" TIMESTAMP(3),
    "user_no" INTEGER NOT NULL,
    "region_no" INTEGER,
    "region_detail_no" INTEGER,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "users" (
    "no" SERIAL NOT NULL,
    "email" VARCHAR(30) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "nickname" VARCHAR(30),
    "phone" VARCHAR(100) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "create_datetime" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_datetime" TIMESTAMP(6),
    "delete_datetime" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "regions" (
    "no" SERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "region_details" (
    "no" SERIAL NOT NULL,
    "region_no" INTEGER NOT NULL,
    "name" VARCHAR(20) NOT NULL,

    CONSTRAINT "region_details_pkey" PRIMARY KEY ("no")
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

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_region_no_fkey" FOREIGN KEY ("region_no") REFERENCES "regions"("no") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_region_detail_no_fkey" FOREIGN KEY ("region_detail_no") REFERENCES "region_details"("no") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "region_details" ADD CONSTRAINT "region_details_region_no_fkey" FOREIGN KEY ("region_no") REFERENCES "regions"("no") ON DELETE NO ACTION ON UPDATE NO ACTION;
