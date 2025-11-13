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
        console.log(credentials);
        // refresh로 받은 경우 (access_token과 user 정보가 이미 있음)
        if (credentials?.access_token && credentials?.no) {
          return {
            access_token: credentials.access_token as string,
            no: Number(credentials.no),
            email: credentials.email as string,
            name: credentials.name as string,
            nickname: (credentials.nickname as string | null) || null,
            phone: (credentials.phone as string | null) || null,
            enabled: Boolean(credentials.enabled),
          };
        }

        // 일반 이메일 로그인
        if (credentials?.email && credentials?.password) {
          const authResponse = await fetch(
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
        }

        return null;
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
