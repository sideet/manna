import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Users } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async get(user: Prisma.UsersWhereInput, prisma: Prisma.TransactionClient = this.prisma): Promise<Users | null> {
    const result = await prisma.users.findFirst({ where: user });

    return result;
  }

  async create(user: Prisma.UsersCreateInput, prisma: Prisma.TransactionClient = this.prisma): Promise<Users> {
    return await prisma.users.create({ data: user });
  }

  async update(params: { where: Prisma.UsersWhereUniqueInput; data: Prisma.UsersUpdateInput }, prisma: Prisma.TransactionClient = this.prisma): Promise<Users> {
    const { where, data } = params;
    return prisma.users.update({
      data,
      where,
    });
  }
}
