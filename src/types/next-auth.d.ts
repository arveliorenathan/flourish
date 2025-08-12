import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  // data yang direturn dari authorize() di credentials provider (lib/auth.ts)
  interface User extends DefaultUser {
    id: string;
    email: string;
    username: string;
    role: string;
  }
  // data yang akan muncul saat akses session, baik di server maupun client
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      username: string;
      role: string;
    };
  }
}
