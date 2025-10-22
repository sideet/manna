import { ApiProperty } from '@nestjs/swagger';

export class RegionDTO {
  @ApiProperty({ type: 'number', example: 1, description: '지역 고유번호' })
  no: number;

  @ApiProperty({ type: 'string', example: '서울특별시', description: '지역명' })
  name: string;
}

export class RegionDetailDTO {
  @ApiProperty({
    type: 'number',
    example: 101,
    description: '상세 지역 고유번호',
  })
  no: number;

  @ApiProperty({
    type: 'string',
    example: '강남구',
    description: '상세 지역명',
  })
  name: string;
}
