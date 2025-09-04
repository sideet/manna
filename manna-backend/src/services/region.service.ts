import { Injectable } from '@nestjs/common';
import { RegionRepository } from 'src/lib/database/repositories';

@Injectable()
export class RegionService {
  constructor(private readonly regionRepository: RegionRepository) {}

  /**
   * 지역 전체 조회(시군구 포함)
   * @method
   */

  async getRegion() {
    const region = await this.regionRepository.gets({
      include: { region_detail: true },
    });

    return { region };
  }
}
