import { ApiProperty } from '@nestjs/swagger';

export class GetUserRequestDTO {
  @ApiProperty({ description: '이메일', type: 'string' })
  email: string;
}
