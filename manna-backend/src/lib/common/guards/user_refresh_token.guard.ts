import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { CommonUtil } from '../utils';
import { UsersRepository } from 'src/lib/database/repositories';

@Injectable()
export class UserRefreshTokenGuard implements CanActivate {
  constructor(
    private readonly commonUtil: CommonUtil,
    private readonly usersRepository: UsersRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const cookie = request.headers.cookie;

    let refresh_token: string | null = null;

    if (cookie) {
      cookie.split(';').forEach((cookie) => {
        const [name, ...rest] = cookie.trim().split('=');

        if (name && name === 'refresh_token')
          refresh_token = decodeURIComponent(rest.join('='));
      });
    }

    if (refresh_token === undefined || refresh_token === null)
      throw new UnauthorizedException('잘못된 접근입니다.');

    const decode_token: any = this.commonUtil.decodeJwtToken(
      refresh_token,
      'refresh'
    );

    if (decode_token === null)
      throw new UnauthorizedException(
        '해당 API의 접근할 권한이 없습니다.',
        'TOKEN_EXPIRE'
      );

    const user = await this.usersRepository.get({
      where: { no: decode_token.user_no },
    });

    if (!user)
      throw new UnauthorizedException('해당 API 접근 권한이 없습니다.');

    if (!user.enabled)
      throw new UnauthorizedException('해당 API 접근 권한이 없습니다.');

    request.user = { user_no: user.no, email: user.email };

    return true;
  }
}
