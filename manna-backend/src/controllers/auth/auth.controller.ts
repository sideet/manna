import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from 'src/services';
import { IOAuthUser } from './dto';
import { SocialType } from 'src/lib/common/enums/user.enum';
import { AuthUser } from 'src/lib/common/dtos';
import { DateConversion, ParamUser } from 'src/lib/common/decorators';
import { LoginReponseDTO, LoginRequestDTO } from './dto/login.dto';
import { UserRefreshTokenGuard } from 'src/lib/common/guards/user_refresh_token.guard';
import { ConfigService } from '@nestjs/config';

@Controller()
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
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
    const { refresh_token } = await this.authService.socialLogin({
      email: user.email,
      name: user.name,
      id: user.id,
      social_type: SocialType.GOOGLE,
    });

    // refresh_token
    res.cookie(`refresh_token`, refresh_token, {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    const manna = this.configService.get('manna');

    return res.redirect(`${manna.clientUrl}/main?redirect=true`);
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
    const { refresh_token } = await this.authService.socialLogin({
      email: user.email,
      name: user.name,
      id: user.id,
      social_type: SocialType.KAKAO,
    });

    // refresh_token
    res.cookie(`refresh_token`, refresh_token, {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    const manna = this.configService.get('manna');

    return res.redirect(`${manna.clientUrl}/main?redirect=true`);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ description: '성공', type: LoginReponseDTO })
  @DateConversion()
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginRequestDTO
  ) {
    const { access_token, user, refresh_token } = await this.authService.login({
      email: body.email,
      password: body.password,
    });

    // refresh_token
    res.cookie(`refresh_token`, refresh_token, {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    return { access_token, user };
  }

  @Get('/auth/refresh')
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: '엑세스 토큰 재발급' })
  @ApiOkResponse({ description: '성공', type: LoginReponseDTO })
  @UseGuards(UserRefreshTokenGuard)
  async restoreAccessTokens(@ParamUser() user: AuthUser) {
    const { access_token, user: _user } = await this.authService.getAccessToken(
      {
        ...user,
      }
    );

    return { access_token, user: _user };
  }
}
