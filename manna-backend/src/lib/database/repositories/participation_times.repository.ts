import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ParticipationTimesRepository {
  constructor(private prisma: PrismaService) {}

  async gets<T extends Prisma.ParticipationTimesFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.ParticipationTimesFindManyArgs>,
    prisma: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.ParticipationTimesGetPayload<T>[]> {
    return prisma.participationTimes.findMany(args);
  }

  async creates<T extends Prisma.ParticipationTimesCreateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.ParticipationTimesCreateManyArgs>,
    prisma: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.BatchPayload> {
    return await prisma.participationTimes.createMany(args);
  }

  async delete<T extends Prisma.ParticipationTimesDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.SchedulesDeleteManyArgs>,
    pool: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.BatchPayload> {
    return pool.participationTimes.deleteMany(args);
  }

  async update<T extends Prisma.ParticipationTimesUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.ParticipationTimesUpdateArgs>,
    prisma: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.ParticipationTimesGetPayload<T>> {
    return prisma.participationTimes.update(args);
  }

  async updateMany<T extends Prisma.ParticipationTimesUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.ParticipationTimesUpdateManyArgs>,
    prisma: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.BatchPayload> {
    return prisma.participationTimes.updateMany(args);
  }
}
