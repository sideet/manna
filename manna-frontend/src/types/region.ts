export interface RegionDetail {
  no: number;
  region_no: number;
  name: string;
}

export interface Region {
  no: number;
  name: string;
  region_detail: RegionDetail[];
}

export interface RegionResponse {
  region: Region[];
}
