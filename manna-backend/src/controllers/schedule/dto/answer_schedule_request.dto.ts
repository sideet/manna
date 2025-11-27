import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class AnswerScheduleRequestDTO {
  @ApiProperty({ description: '일정고유번호', type: 'number' })
  @Transform(({ value }) => Number(value))
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: '일정고유번호를 확인해 주세요.' }
  )
  schedule_no: number;

  @ApiProperty({ description: '이메일', type: 'string' })
  @IsEmail({}, { message: '이메일 양식을 맞춰주세요.' })
  email: string;

  @ApiProperty({ description: '이름', type: 'string' })
  @IsString({ message: '이름을 확인해 주세요.' })
  @Length(2, 20, { message: '이름은 2자이상 20자 이하이어야 합니다.' })
  name: string;

  @ApiProperty({ description: '휴대폰번호', type: 'string' })
  @IsOptional()
  @IsString({ message: '휴대폰번호을 확인해 주세요.' })
  @Length(10, 11, { message: '휴대폰번호는 10자 또는 11자이어야 합니다.' })
  phone?: string;

  @ApiProperty({ description: '메모', type: 'string', required: false })
  @IsOptional()
  @IsString({ message: '메모를 확인해 주세요.' })
  @MaxLength(300, { message: '메모는 200자 이하이어야 합니다.' })
  memo?: string;

  @ApiProperty({ description: '참석 시간', type: 'array', example: [1, 2, 3] })
  @IsArray({ message: '참석 시간을 확인해 주세요.' })
  @IsNumber({}, { each: true, message: '참석 시간은 숫자로 입력해 주세요.' })
  schedule_unit_nos: number[];
}
