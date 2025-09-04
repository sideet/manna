import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { signOut } from "next-auth/react";

const clientApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  timeout: 10000,
});

/** 요청: 토큰 자동 첨부 (public API는 headers.skipAuth === true 로 제외) */
clientApi.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig & { headers: Record<string, unknown> }
  ) => {
    if (!config.headers?.skipAuth) {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

/** 응답: 401 공통 처리 (토큰만료) */
clientApi.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status;
    // const cfg: any = err.config;
    // const cfg = err.config as InternalAxiosRequestConfig & {
    //   headers?: Record<string, unknown>;
    // };

    if (status === 401) {
      console.log("401 발생!..");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // 비동기로 로그아웃 처리
      setTimeout(async () => {
        await signOut({ callbackUrl: "/login", redirect: true });
      }, 500); // 0.5초 후 로그아웃 (토스트 메시지 표시 시간 확보)
    }

    // 나머지는 그대로 throw 해서 화면에서 개별 처리(toast 등)
    return Promise.reject(err);
  }
);

export default clientApi;
