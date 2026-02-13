import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetIndividualConfirmInfoRequestDTO {
  @ApiProperty({ description: '일정고유번호', type: 'number' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  schedule_no: number;
}

class ConfirmedUnitDTO {
  @ApiProperty({ type: 'number', example: 1 })
  no: number;

  @ApiProperty({ type: 'string', example: '2025-09-29' })
  date: string;

  @ApiProperty({ type: 'string', example: '09:00:00', nullable: true })
  time: string | null;
}

class ConfirmedParticipantDTO {
  @ApiProperty({ type: 'number', example: 1 })
  no: number;

  @ApiProperty({ type: 'string', example: '홍길동' })
  name: string;

  @ApiProperty({ type: 'string', example: 'hong@example.com' })
  email: string;

  @ApiProperty({ type: 'boolean', example: true })
  is_confirmed: boolean;

  @ApiProperty({ type: 'boolean', example: false, description: '확정 메일 전송 여부' })
  is_confirmation_mail_sent: boolean;

  @ApiProperty({
    type: () => ConfirmedUnitDTO,
    nullable: true,
    description: '확정된 일정 단위 (날짜/시간)',
  })
  confirmed_unit: ConfirmedUnitDTO | null;
}

export class GetIndividualConfirmInfoResponseDTO {
  @ApiProperty({ type: 'number', example: 1 })
  schedule_no: number;

  @ApiProperty({ type: 'string', example: '1:1 미팅' })
  schedule_name: string;

  @ApiProperty({ type: 'boolean', example: true, description: '일정 확정 여부' })
  is_confirmed: boolean;

  @ApiProperty({
    type: () => [ConfirmedParticipantDTO],
    description: '확정된 참가자 목록 (각자 확정된 시간대 포함)',
  })
  confirmed_participants: ConfirmedParticipantDTO[];
}
