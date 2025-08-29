import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async get<T extends Prisma.UsersFindFirstArgs>(args: Prisma.SelectSubset<T, Prisma.UsersFindFirstArgs>, prisma: Prisma.TransactionClient = this.prisma): Promise<Prisma.UsersGetPayload<T> | null> {
    return prisma.users.findFirst(args);
  }

  async create<T extends Prisma.UsersCreateArgs>(args: Prisma.SelectSubset<T, Prisma.UsersCreateArgs>, prisma: Prisma.TransactionClient = this.prisma): Promise<Prisma.UsersGetPayload<T>> {
    return await prisma.users.create(args);
  }

  async update<T extends Prisma.UsersUpdateArgs>(args: Prisma.SelectSubset<T, Prisma.UsersUpdateArgs>, pool: Prisma.TransactionClient = this.prisma): Promise<Prisma.UsersGetPayload<T>> {
    return pool.users.update(args);
  }
}
