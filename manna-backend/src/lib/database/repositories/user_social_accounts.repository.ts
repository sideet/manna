import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserSocialAccountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async get<T extends Prisma.UserSocialAccountsFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserSocialAccountsFindFirstArgs>,
    prisma: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.UserSocialAccountsGetPayload<T> | null> {
    return prisma.userSocialAccounts.findFirst(args);
  }

  async create<T extends Prisma.UserSocialAccountsCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserSocialAccountsCreateArgs>,
    prisma: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.UserSocialAccountsGetPayload<T>> {
    return await prisma.userSocialAccounts.create(args);
  }

  async update<T extends Prisma.UserSocialAccountsUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserSocialAccountsUpdateArgs>,
    pool: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.UserSocialAccountsGetPayload<T>> {
    return pool.userSocialAccounts.update(args);
  }
}
