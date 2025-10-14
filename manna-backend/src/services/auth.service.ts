import { BadRequestException, Injectable } from '@nestjs/common';
import { SocialType } from 'src/lib/common/enums/user.enum';
import { CommonUtil } from 'src/lib/common/utils';
import { PrismaService } from 'src/lib/database/prisma.service';
import {
  UserSocialAccountsRepository,
  UsersRepository,
} from 'src/lib/database/repositories';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepository: UsersRepository,
    private readonly userSocialAccountsRepository: UserSocialAccountsRepository
  ) {}

  async socialLogin({
    email,
    name,
    id,
    social_type,
  }: {
    email: string;
    name: string;
    id: string;
    social_type: SocialType;
  }) {
    if (!email) throw new BadRequestException('소셜 로그인에 실패했습니다.');

    const social_user: { user_no: number | null; email: string | null } = {
      user_no: null,
      email: null,
    };

    const user = await this.usersRepository.get({
      where: { email },
      include: { user_social_accounts: true },
    });

    await this.prisma.$transaction(async (connection) => {
      // 회원가입
      if (!user) {
        // 비밀번호 해싱
        const create_user = await this.usersRepository.create(
          {
            data: {
              email,
              name,
            },
          },
          connection
        );

        await this.userSocialAccountsRepository.create(
          {
            data: {
              user_no: create_user.no,
              provider: social_type,
              id,
            },
          },
          connection
        );

        social_user.user_no = create_user.no;
        social_user.email = create_user.email;
      } else {
        const social_account = await this.userSocialAccountsRepository.get(
          {
            where: { user_no: user.no, provider: social_type },
          },
          connection
        );

        if (!social_account) {
          await this.userSocialAccountsRepository.create(
            {
              data: {
                user_no: user.no,
                provider: social_type,
                id,
              },
            },
            connection
          );
        }

        // 기존 회원
        social_user.user_no = user.no;
        social_user.email = user.email;
      }
    });

    console.log('social_user:::', social_user);

    return { social_user };
  }
}
