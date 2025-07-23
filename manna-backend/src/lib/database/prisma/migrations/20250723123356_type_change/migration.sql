-- DropIndex
DROP INDEX "Schedule_participants_email_key";

-- AlterTable
ALTER TABLE "Schedule_participants" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;
