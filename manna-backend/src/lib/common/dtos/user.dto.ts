import { ApiProperty } from '@nestjs/swagger';

export class UserDTO {
  @ApiProperty({ type: 'number', example: 1 })
  no: number;

  @ApiProperty({ type: 'string', example: '지니' })
  name: string;

  @ApiProperty({ type: 'string', example: 'aaa@aaa.com' })
  email: string;

  @ApiProperty({
    type: 'string',
    example: null,
    nullable: true,
    description: '닉네임',
  })
  nickname: string | null;

  @ApiProperty({ type: 'string', example: null, nullable: true })
  phone: string | null;

  @ApiProperty({ type: 'boolean', example: true })
  enabled: boolean;

  @ApiProperty({ type: 'string', example: '2025-10-21 17:34:55' })
  create_datetime: string | Date;

  @ApiProperty({ type: 'string', example: '2025-10-21 17:34:55' })
  update_datetime: string | Date;

  @ApiProperty({ type: 'string', example: null, nullable: true })
  delete_datetime: string | Date | null;
}
``;
