import "next-auth";

declare module "next-auth" {
  interface User {
    user_no: number;
    email: string;
    nickname?: string;
    name: string;
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
