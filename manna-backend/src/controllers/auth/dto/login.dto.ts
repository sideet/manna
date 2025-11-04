import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { UserDTO } from 'src/lib/common/dtos';

export class LoginRequestDTO {
  @ApiProperty({
    description: '이메일',
    type: 'string',
    example: 'aaa@aaa.com',
  })
  @IsEmail({}, { message: '이메일 양식을 맞춰주세요.' })
  email: string;

  @ApiProperty({
    description: '비밀번호',
    type: 'string',
    example: 'qwer1234!',
  })
  @IsString({ message: '비밀번호를 입력해 주세요.' })
  password: string;
}

export class LoginReponseDTO {
  @ApiProperty({
    type: 'string',
    example: 'string',
    description: 'Access Token (JWT)',
  })
  access_token: string;

  @ApiProperty({ type: UserDTO })
  user: UserDTO;
}
