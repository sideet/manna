import "next-auth";

declare module "next-auth" {
  interface User {
    no: number;
    name: string;
    email: string;
    nickname: string | null;
    phone: string | null;
    enabled: boolean;
  }

  interface Session {
    accessToken: string;
    user: User;
  }

  interface JWT {
    accessToken: string;
    user: User;
  }
}
