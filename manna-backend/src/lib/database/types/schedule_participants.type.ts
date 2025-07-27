import { Prisma } from '@prisma/client';

export type ScheduleParticipantWithTimesAndUnits = Prisma.ScheduleParticipantsGetPayload<{
  include: {
    participation_times: {
      include: {
        schedule_unit: true;
      };
    };
  };
}>;
