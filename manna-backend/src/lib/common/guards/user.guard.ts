import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CommonUtil } from '../utils';
import { UsersRepository } from 'src/lib/database/repositories';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly commonUtil: CommonUtil,
    private readonly usersRepository: UsersRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request.headers.authorization === undefined || request.headers.authorization === null) throw new UnauthorizedException('해당 API의 접근할 권한이 없습니다.');

    const access_token = request.headers.authorization.split(' ')[1];

    const decode_token: any = this.commonUtil.decodeJwtToken(access_token);

    if (decode_token === null) throw new UnauthorizedException('해당 API의 접근할 권한이 없습니다.', 'TOKEN_EXPIRE');

    const user = await this.usersRepository.get({ where: { no: decode_token.user_no } });

    if (!user.enabled) throw new UnauthorizedException('해당 API의 접근할 권한이 없습니다.');

    request.user = { user_no: user.no };

    return true;
  }
}
