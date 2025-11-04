import { ApiProperty, OmitType, getSchemaPath } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsString, Matches } from 'class-validator';
import { ScheduleParticipantDTO, ScheduleUnitDTO } from 'src/lib/common/dtos';

export class GetScheduleUnitsRequestDTO {
  @ApiProperty({ description: '일정고유번호', type: 'number' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  schedule_no: number;

  @ApiProperty({ description: '검색날짜', type: 'string' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'search_date YYYY-MM-DD 형식이어야 합니다.',
  })
  search_date: string;
}

class CustomScheduleParticipantDTO extends OmitType(ScheduleParticipantDTO, [
  'schedule_no',
  'delete_datetime',
  'participation_times',
] as const) {}

export class GetScheduleUnitsResponseDTO {
  @ApiProperty({
    description: '날짜별 스케줄 단위 정보',
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: {
        allOf: [
          { $ref: getSchemaPath(ScheduleUnitDTO) },
          {
            properties: {
              schedule_participants: {
                type: 'array',
                items: { $ref: getSchemaPath(ScheduleParticipantDTO) },
              },
            },
          },
        ],
      },
    },
    example: {
      '2025-10-25': [
        {
          no: 1,
          time: '18:00:00',
          enabled: true,
          date: '2025-10-25',
          schedule_no: 5,
          schedule_participants: [
            {
              no: 1,
              email: 'hong@test.com',
              name: '홍길동',
              phone: '01012345678',
              memo: '메모 내용',
              create_datetime: '2025-10-21 14:32:00',
              update_datetime: '2025-10-22 09:00:00',
            },
          ],
        },
      ],
    },
  })
  schedule_units: Record<
    string,
    (ScheduleUnitDTO & {
      schedule_participants: CustomScheduleParticipantDTO[];
    })[]
  >;
}
