import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
  }
  
  interface Session {
    user: User & {
      role: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
  }
}
