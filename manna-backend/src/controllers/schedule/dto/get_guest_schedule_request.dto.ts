import { ApiProperty } from '@nestjs/swagger';

export class GetGuestScheduleRequestDTO {
  @ApiProperty({ description: '일정코드', type: 'string' })
  code: string;
}
