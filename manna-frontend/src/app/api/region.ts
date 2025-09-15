import serverApi from "./server";
import { RegionResponse } from "@/types/region";

export async function getRegions(): Promise<RegionResponse> {
  try {
    const response = await serverApi.get<RegionResponse>("/region", {
      headers: { skipAuth: true },
    });
    return response.data;
  } catch (error) {
    console.error("지역 데이터 조회 실패:", error);
    throw error;
  }
}
