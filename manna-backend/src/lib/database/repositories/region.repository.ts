import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RegionRepository {
  constructor(private prisma: PrismaService) {}

  async gets<T extends Prisma.RegionFindManyArgs>(args: Prisma.SelectSubset<T, Prisma.RegionFindManyArgs>, pool: PrismaClient = this.prisma): Promise<Prisma.RegionGetPayload<T>[]> {
    return pool.region.findMany(args);
  }

  async get<T extends Prisma.RegionFindFirstArgs>(args: Prisma.SelectSubset<T, Prisma.RegionFindFirstArgs>, pool: PrismaClient = this.prisma): Promise<Prisma.RegionGetPayload<T> | null> {
    return pool.region.findFirst(args);
  }
}
