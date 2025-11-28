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
    private readonly commonUtil: CommonUtil,
    private readonly prisma: PrismaService,
    private readonly usersRepository: UsersRepository,
    private readonly userSocialAccountsRepository: UserSocialAccountsRepository
  ) {}

  async login({ email, password }: { email: string; password: string }) {
    const user = await this.usersRepository.get({ where: { email } });

    if (!user) throw new BadRequestException('잘못된 이메일, 비밀번호입니다.');

    if (!user.enabled) throw new BadRequestException('탈퇴한 회원정보입니다.');

    const is_password_match = await this.commonUtil.bcryptCompare(
      password,
      user.password
    );

    if (!is_password_match)
      throw new BadRequestException('잘못된 이메일, 비밀번호입니다.');

    const access_token = this.commonUtil.encodeJwtToken(
      {
        user_no: user.no,
        email,
      },
      {
        expiresIn: '2h',
      }
    );

    const refresh_token = this.commonUtil.encodeJwtToken(
      {
        user_no: user.no,
        email,
      },
      {
        expiresIn: '14d',
      },
      'refresh'
    );

    // 비밀번호 제외
    delete user.password;

    return { access_token, user: { ...user }, refresh_token };
  }

  /**
   * 엑세스 토큰 발급
   * @method
   */
  async getAccessToken({ user_no, email }: { user_no: number; email: string }) {
    if (!user_no) throw new BadRequestException('로그인을 다시 시도해 주세요.');

    const user = await this.usersRepository.get({
      where: { no: user_no },
    });

    if (!user) throw new BadRequestException('로그인을 다시 시도해 주세요.');

    const access_token = this.commonUtil.encodeJwtToken(
      {
        user_no,
        email,
      },
      {
        expiresIn: '1d',
      }
    );
    // 비밀번호 제외
    delete user.password;

    return {
      access_token,
      user: { ...user },
    };
  }

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

    const { refresh_token } = await this.prisma.$transaction(
      async (connection) => {
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

        // refresh_token 발급
        const refresh_token = this.commonUtil.encodeJwtToken(
          {
            user_no: social_user.user_no,
            email,
          },
          {
            expiresIn: '14d',
          },
          'refresh'
        );

        return { refresh_token };
      }
    );

    return { refresh_token };
  }
}
