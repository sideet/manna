import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    const kakao = configService.get('kakao');

    const clientID = kakao.oauthClinetID;
    const clientSecret = kakao.oauthSecrectKey;
    const callbackURL = kakao.oauthCallbackUrl;

    super({
      clientID,
      clientSecret,
      callbackURL,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { _json } = profile;
    const user = {
      email: _json.kakao_account.email,
      id: String(_json.id),
      name: _json.properties.nickname,
    };

    return user;
  }
}
