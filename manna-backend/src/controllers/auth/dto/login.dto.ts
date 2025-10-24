import { ApiProperty } from '@nestjs/swagger';
import { UserDTO } from 'src/lib/common/dtos';

export class LoginRequestDTO {
  @ApiProperty({
    description: '이메일',
    type: 'string',
    example: 'aaa@aaa.com',
  })
  email: string;

  @ApiProperty({ description: '비밀번호', type: 'string', example: 'qwer1234' })
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
