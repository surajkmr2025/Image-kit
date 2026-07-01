import { Connection } from "mongoose"

//Mongoose global connection cache
declare global {
    var mongoose: {
        conn: Connection | null
        promise: Promise<Connection> | null
    };
}
// 2. NextAuth Session and User Extensions
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    provider?: string;
  }
}

// 3. NextAuth JWT Extension
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export {}