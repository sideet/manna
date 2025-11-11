import NextAuth, { User } from "next-auth";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login/email",
    newUser: "/signup",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const authResponse = await fetch(
          // TODO: 백엔드 로그인 엔드포인트로 변경 (/auth/login)
          `${process.env.NEXT_PUBLIC_BASE_URL}/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          }
        );

        if (!authResponse.ok) return null;

        const { access_token, user } = await authResponse.json();
        return { access_token, ...user };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        const u = user as User & { access_token: string }; // 명시적 타입 캐스팅
        token.accessToken = u.access_token;
        token.user = {
          no: u.no,
          email: u.email,
          name: u.name,
          nickname: u.nickname,
          phone: u.phone,
          enabled: u.enabled,
        };
      }
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken as string;
      session.user = token.user as User;
      return session;
    },
  },
});
