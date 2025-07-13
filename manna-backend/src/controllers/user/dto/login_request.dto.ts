import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDTO {
  @ApiProperty({ description: '이메일', type: 'string' })
  email: string;

  @ApiProperty({ description: '비밀번호', type: 'string' })
  password: string;
}
