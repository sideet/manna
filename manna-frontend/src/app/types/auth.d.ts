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

export interface RefreshResponse {
  access_token: string;
  user: {
    no: number;
    name: string;
    email: string;
    nickname: string | null;
    phone: string | null;
    enabled: boolean;
    create_datetime: string;
    update_datetime: string;
    delete_datetime: string | null;
  };
}
