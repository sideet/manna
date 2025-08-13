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

export type GetsScheduleParticipantsInput = {
  where: Prisma.ScheduleParticipantsWhereInput;
  take?: number;
  cursor?: {
    no: number;
  };
  sort?: 'desc' | 'asc';
};
