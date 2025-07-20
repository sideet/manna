import { Prisma } from '@prisma/client';

export type ScheduleWithParticipants = Prisma.SchedulesGetPayload<{
  include: {
    schedule_participants: true;
  };
}>;
