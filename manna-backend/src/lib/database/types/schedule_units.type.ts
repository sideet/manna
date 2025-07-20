import { Prisma } from '@prisma/client';

export type ScheduleUnitWithParticipants = Prisma.Schedule_unitsGetPayload<{
  include: {
    participation_times: {
      include: {
        schedule_participants: true;
      };
    };
  };
}>;
