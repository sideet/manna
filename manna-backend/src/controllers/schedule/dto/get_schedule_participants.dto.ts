import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';
import {
  CursorPaginationRequestDTO,
  CursorPaginationResponsetDTO,
  ScheduleParticipantDTO,
} from 'src/lib/common/dtos';

export class GetScheduleParticipantsRequestDTO extends CursorPaginationRequestDTO {
  @ApiProperty({ description: '일정고유번호', type: 'number' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  schedule_no: number;
}

export class GetScheduleParticipantsResponseDTO extends CursorPaginationResponsetDTO {
  @ApiProperty({
    type: () => [ScheduleParticipantDTO],
    description: '일정 참석자 리스트',
  })
  schedule_participants: ScheduleParticipantDTO[];
}
