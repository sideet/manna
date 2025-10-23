import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto-js';
import JWT from 'jsonwebtoken';
import axios from 'axios';

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

  encodeJwtToken(
    payload: any,
    options: any,
    type: 'access' | 'refresh' = 'access'
  ): string {
    try {
      const jwt = this.configService.get('jwt');

      return JWT.sign(payload, jwt.jwtAccessKey, {
        ...options,
        algorithm: jwt.algorithm,
        issuer: jwt.issuer,
      });
    } catch (e) {
      this.logger.error('JWT 토큰 발급 에러', e);
    }
  }

  decodeJwtToken(
    token: string,
    type: 'access' | 'refresh' = 'access'
  ): any | null {
    try {
      const jwt = this.configService.get('jwt');
      if (type === 'access') token = token.replace('Bearer ', '');

      return JWT.verify(token, jwt.jwtAccessKey, {
        algorithms: jwt.algorithm,
        issuer: jwt.issuer,
      });
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
    const chars =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async sendServerErrorAlert(data: {
    method: string;
    url: string;
    status: number;
    message: string;
    inputs?: string;
    stack?: string;
  }) {
    const webhook = this.configService.get('webhook');
    const webhook_url = webhook.serverError;
    if (!webhook_url) return;

    try {
      await axios.post(webhook_url, {
        content: null,
        embeds: [
          {
            title: '[서버 에러 발생]',
            color: 0xff0000,
            fields: [
              {
                name: '요청',
                value: `${data.method} ${data.url}`,
                inline: false,
              },
              { name: '상태 코드', value: `${data.status}`, inline: true },
              { name: '메시지', value: data.message, inline: false },
              ...(data.inputs
                ? [
                    {
                      name: '요청 정보',
                      value: `\`\`\`json\n${data.inputs}\n\`\`\``,
                    },
                  ]
                : []),
              ...(data.stack
                ? [
                    {
                      name: '에러',
                      value: `\`\`\`\n${data.stack.slice(0, 1000)}\n\`\`\``,
                    },
                  ]
                : []),
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } catch (error) {
      // 실패 시 로깅만
      this.logger.error('서버 에러 알림 전송 실패', error);
    }
  }
}
