import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { PartialUserDTO, ScheduleDTO } from 'src/lib/common/dtos';

export class GetGuestScheduleRequestDTO {
  @ApiProperty({
    description: '일정코드',
    type: 'string',
    example: 'Q1234',
  })
  @IsString()
  @MaxLength(6, { message: '코드는 6자이하이어야 합니다.' })
  code: string;
}

class ScheduleDetailDTO extends ScheduleDTO {
  @ApiProperty({ type: PartialUserDTO })
  user: PartialUserDTO;
}

export class GetGuestScheduleResponseDTO {
  @ApiProperty({ type: () => ScheduleDetailDTO })
  schedule: ScheduleDetailDTO;
}
