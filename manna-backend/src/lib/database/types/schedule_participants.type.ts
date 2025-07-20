import { Prisma } from '@prisma/client';

export type ScheduleParticipantWithTimesAndUnits = Prisma.Schedule_participantsGetPayload<{
  include: {
    participation_times: {
      include: {
        schedule_unit: true;
      };
    };
  };
}>;
