import { ApiProperty } from '@nestjs/swagger';

class RegionDetailDTO {
  @ApiProperty({ description: '지역상세고유번호', type: 'number' })
  no: number;

  @ApiProperty({ description: '지역고유번호', type: 'number' })
  shop_region_no: number;

  @ApiProperty({ description: '시군구명', type: 'string' })
  name: string;
}

export class GetRegionResponseDTO {
  @ApiProperty({ description: '지역고유번호', type: 'number' })
  no: number;

  @ApiProperty({ description: '지역명', type: 'string' })
  name: string;

  @ApiProperty({ description: '지역상세리스트', type: [RegionDetailDTO] })
  region_detail: RegionDetailDTO[];
}
