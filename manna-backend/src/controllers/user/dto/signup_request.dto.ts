import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SocialType } from 'src/lib/common/enums/user.enum';

export class SignupRequestDTO {
  @ApiProperty({ description: '이메일', type: 'string' })
  email: string;

  @ApiProperty({ description: '비밀번호', type: 'string' })
  password: string;

  @ApiProperty({ description: '이름', type: 'string' })
  name: string;

  @ApiProperty({ description: '휴대폰번호', type: 'string', required: false })
  phone?: string;

  // TODO 1차 보류
  @ApiProperty({ description: '닉네임', type: 'string', required: false })
  nickname?: string;
}
