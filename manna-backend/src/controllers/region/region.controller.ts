import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { RegionService } from 'src/services';
import { GetRegionResponseDTO } from './dto/get_region.dto';

@Controller()
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get('/region')
  @ApiOperation({ summary: '지역 조회' })
  @ApiOkResponse({ type: [GetRegionResponseDTO] })
  async getRegion() {
    const { region } = await this.regionService.getRegion();
    return { region };
  }
}
