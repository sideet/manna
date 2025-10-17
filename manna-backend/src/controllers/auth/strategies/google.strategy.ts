import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    const google = configService.get('google');

    const clientID = google.oauthClinetID;
    const clientSecret = google.oauthSecrectKey;
    const callbackURL = google.oauthCallbackUrl;

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = {
      email: profile.emails[0].value,
      id: String(profile.id),
      name: profile.displayName,
    };
    return user;
  }
}
