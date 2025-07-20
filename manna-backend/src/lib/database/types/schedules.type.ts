import { Prisma } from '@prisma/client';

export type ScheduleWithParticipants = Prisma.SchedulesGetPayload<{
  include: {
    schedule_participants: true;
  };
}>;

export type ScheduleWithUser = Prisma.SchedulesGetPayload<{
  include: {
    user: true;
  };
}>;
