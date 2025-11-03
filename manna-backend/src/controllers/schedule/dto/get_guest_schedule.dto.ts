import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PartialUserDTO, ScheduleDTO, UserDTO } from 'src/lib/common/dtos';

export class GetGuestScheduleRequestDTO {
  @ApiProperty({
    description: '일정코드',
    type: 'string',
    example: 'Q1234',
  })
  @IsString()
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
