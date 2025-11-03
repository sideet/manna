import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class SignupRequestDTO {
  @ApiProperty({ description: '이메일', type: 'string' })
  @IsEmail({}, { message: '이메일 양식을 맞춰주세요.' })
  email: string;

  @ApiProperty({ description: '비밀번호', type: 'string' })
  @IsString()
  @Length(7, 12, { message: '비밀번호는 7자이상 12자 이하이어야 합니다.' })
  password: string;

  @ApiProperty({ description: '이름', type: 'string' })
  @Length(2, 20, { message: '이름은 2자이상 20자 이하이어야 합니다.' })
  name: string;

  // TODO 1차 보류
  @ApiProperty({ description: '휴대폰번호', type: 'string', required: false })
  @IsString()
  phone?: string;

  // TODO 1차 보류
  @ApiProperty({ description: '닉네임', type: 'string', required: false })
  nickname?: string;
}
