import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetGuestScheduleRequestDTO {
  @ApiProperty({ description: '일정코드', type: 'string' })
  code: string;

  @ApiProperty({ description: '게스트이메일', type: 'string', required: false })
  @IsOptional()
  email: string;
}
