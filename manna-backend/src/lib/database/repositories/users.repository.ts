import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Users } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async get(user: Prisma.UsersWhereInput): Promise<Users | null> {
    const result = await this.prisma.users.findFirst({ where: user });

    return result;
  }

  async create(user: Prisma.UsersCreateInput): Promise<Users> {
    return await this.prisma.users.create({ data: user });
  }

  async update(params: { where: Prisma.UsersWhereUniqueInput; data: Prisma.UsersUpdateInput }): Promise<Users> {
    const { where, data } = params;
    return this.prisma.users.update({
      data,
      where,
    });
  }
}
