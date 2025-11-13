import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { signOut, getSession, signIn } from "next-auth/react";
import { RefreshResponse } from "../types/auth";

const clientApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  timeout: 10000,
});

/** 요청: 토큰 자동 첨부 (public API는 headers.skipAuth === true 로 제외) */
clientApi.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig & { headers: Record<string, unknown> }
  ) => {
    if (!config.headers?.skipAuth) {
      // Next-Auth 세션에서 토큰 가져오기
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  }
);

/** 응답: 401 공통 처리 (토큰만료 -> refresh 요청) */
clientApi.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    // 기존 요청
    const originalRequest = err.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      headers: Record<string, unknown>;
    };

    const status = err.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // refresh 요청 시도
        const refreshResponse = await axios.get<RefreshResponse>(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh`,
          {
            withCredentials: true, // 쿠키 포함
          }
        );

        const { access_token, user } = refreshResponse.data;

        // Next-Auth 세션 업데이트 (없으면 로그인, 있으면 업데이트)
        await signIn("credentials", {
          access_token,
          email: user.email,
          name: user.name,
          no: String(user.no),
          nickname: user.nickname || null,
          phone: user.phone || null,
          enabled: String(user.enabled),
          redirect: false,
        });

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return clientApi(originalRequest);
      } catch (refreshError) {
        // refresh 실패 시 로그아웃하고 로그인 페이지로 리다이렉트
        console.error("토큰 갱신 실패:", refreshError);
        await signOut({ redirect: false });
        setTimeout(() => {
          window.location.replace("/login");
        }, 500);
        return Promise.reject(refreshError);
      }
    }

    // 나머지는 그대로 throw 해서 화면에서 개별 처리(toast 등)
    return Promise.reject(err);
  }
);

export default clientApi;
