import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RegionDetailRepository {
  constructor(private prisma: PrismaService) {}

  async gets<T extends Prisma.RegionDetailFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.RegionDetailFindManyArgs>,
    pool: PrismaClient = this.prisma
  ): Promise<Prisma.RegionDetailGetPayload<T>[]> {
    return pool.regionDetail.findMany(args);
  }

  async get<T extends Prisma.RegionDetailFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.RegionDetailFindFirstArgs>,
    pool: PrismaClient = this.prisma
  ): Promise<Prisma.RegionDetailGetPayload<T> | null> {
    return pool.regionDetail.findFirst(args);
  }
}
