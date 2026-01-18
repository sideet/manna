-- AlterTable
ALTER TABLE "schedule_participants" ADD COLUMN     "is_confirmed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "schedules" ALTER COLUMN "description" SET DATA TYPE VARCHAR(500);
