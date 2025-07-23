import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto-js';
import JWT from 'jsonwebtoken';

@Injectable()
export class CommonUtil {
  private readonly logger = new Logger(CommonUtil.name);

  constructor(private readonly configService: ConfigService) {}

  async bcrypt(text: string): Promise<string> {
    const encrypt = this.configService.get('encrypt');

    const salt = await bcrypt.genSalt(Number(encrypt.saltOrRounds));

    return await bcrypt.hash(text, salt);
  }

  async bcryptCompare(text: string, origin_text: string): Promise<boolean> {
    const is_match = await bcrypt.compare(text, origin_text);
    return is_match;
  }

  encodeJwtToken(payload: any, options: any): string {
    try {
      const jwt = this.configService.get('jwt');

      return JWT.sign(payload, jwt.jwtAccessKey, { ...options, algorithm: jwt.algorithm, issuer: jwt.issuer });
    } catch (e) {
      this.logger.error('JWT 토큰 발급 에러', e);
    }
  }

  decodeJwtToken(token: string): any | null {
    try {
      const jwt = this.configService.get('jwt');
      return JWT.verify(token, jwt.jwtAccessKey, { algorithms: jwt.algorithm, issuer: jwt.issuer });
    } catch (e) {
      return null;
    }
  }

  encrypt(data: string): string {
    const key = this.configService.get('encrypt');
    return crypto.AES.encrypt(data, key.secret).toString();
  }

  decrypt(data: string): string {
    const key = this.configService.get('encrypt');
    return crypto.AES.decrypt(data, key.secret).toString(crypto.enc.Utf8);
  }

  generateBase62Code(length = 6): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
