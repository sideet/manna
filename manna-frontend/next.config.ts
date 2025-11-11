import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    // SVG를 React 컴포넌트로 import할 수 있도록 설정
    const fileLoaderRule = config.module.rules.find((rule: any) => {
      if (!rule.test) return false;
      // rule.test가 RegExp인지 확인
      if (rule.test instanceof RegExp) {
        return rule.test.test(".svg");
      }
      return false;
    });

    // SVG를 React 컴포넌트로 변환하는 규칙 추가
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: { and: [/\.(js|ts|jsx|tsx|md)x?$/] },
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            typescript: true,
            dimensions: false,
          },
        },
      ],
    });

    // 기존 파일 로더가 SVG를 처리하지 않도록 제외
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    return config;
  },
};

export default nextConfig;
