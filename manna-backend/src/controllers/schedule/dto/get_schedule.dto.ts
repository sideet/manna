import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { PartialUserDTO, ScheduleDTO } from 'src/lib/common/dtos';

export class GetScheduleRequestDTO {
  @ApiProperty({ description: '일정고유번호', type: 'number' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  schedule_no: number;
}

class ScheduleDetailDTO extends ScheduleDTO {
  @ApiProperty({ type: () => PartialUserDTO })
  user: PartialUserDTO;
}

export class GetScheduleResponseDTO {
  @ApiProperty({ type: () => ScheduleDetailDTO })
  schedule: ScheduleDetailDTO;
}
