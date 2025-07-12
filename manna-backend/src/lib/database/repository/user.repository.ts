import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async getUser({ email }) {
    const result = await this.prisma.users.findFirst({ where: { email } });

    return result;
  }
}
