import { NextRequest, NextResponse } from "next/server";
import serverApi from "@/app/api/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const scheduleNo = searchParams.get("schedule_no");
    const searchDate = searchParams.get("search_date");

    if (!scheduleNo || !searchDate) {
      return NextResponse.json(
        { error: "schedule_no and search_date are required" },
        { status: 400 }
      );
    }

    // 서버에서만 민감한 API 호출
    const response = await serverApi.get(
      `/schedule/units/guest?schedule_no=${scheduleNo}&search_date=${searchDate}`,
      {
        headers: { skipAuth: true },
      }
    );

    // TODO: 필요한 정보만 반환처리
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
