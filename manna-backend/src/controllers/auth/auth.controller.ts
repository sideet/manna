import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CommonUtil } from 'src/lib/common/utils';
import { AuthService } from 'src/services';
import { IOAuthUser } from './dto';
import { SocialType } from 'src/lib/common/enums/user.enum';

@Controller()
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly commonUtil: CommonUtil,
    private readonly authService: AuthService
  ) {}
  @Get('/login/google')
  @UseGuards(AuthGuard('google'))
  async loginGoogle(@Req() req: Request) {}

  @Get('/auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: Request & IOAuthUser,
    @Res() res: Response
  ) {
    const { user } = req;
    const { social_user } = await this.authService.socialLogin({
      email: user.email,
      name: user.name,
      id: user.id,
      social_type: SocialType.GOOGLE,
    });

    const access_token = this.commonUtil.encodeJwtToken(
      {
        user_no: social_user.user_no,
        email: social_user.email,
      },
      {
        expiresIn: '1d',
      }
    );

    return res.send({ access_token, user: { ...social_user } });
  }

  @Get('/login/kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoGoogle(@Req() req: Request) {}

  @Get('/auth/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(
    @Req() req: Request & IOAuthUser,
    @Res() res: Response
  ) {
    const { user } = req;
    const { social_user } = await this.authService.socialLogin({
      email: user.email,
      name: user.name,
      id: user.id,
      social_type: SocialType.KAKAO,
    });

    const access_token = this.commonUtil.encodeJwtToken(
      {
        user_no: social_user.user_no,
        email: social_user.email,
      },
      {
        expiresIn: '1d',
      }
    );

    return res.send({ access_token, user: { ...social_user } });
  }
}
