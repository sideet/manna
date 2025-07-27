import { Prisma } from '@prisma/client';

export type ScheduleUnitWithParticipants = Prisma.ScheduleUnitsGetPayload<{
  include: {
    participation_times: {
      include: {
        schedule_participant: true;
      };
    };
  };
}>;
