import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNumber } from 'class-validator';

export class SendConfirmationEmailRequestDTO {
  @ApiProperty({ description: '일정고유번호', type: 'number' })
  @Transform(({ value }) => Number(value))
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '일정고유번호를 확인해 주세요.' }
  )
  schedule_no: number;

  @ApiProperty({
    description: '메일 전송할 참가자 고유번호 목록',
    type: 'array',
    example: [1, 2, 3],
  })
  @IsArray({ message: '참가자 목록을 확인해 주세요.' })
  @IsNumber({}, { each: true, message: '참가자 고유번호는 숫자로 입력해 주세요.' })
  schedule_participant_nos: number[];
}
