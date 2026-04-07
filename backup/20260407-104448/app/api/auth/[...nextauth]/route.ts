import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 하드코딩된 관리자 계정 (프로토타입용)
        // 실제 프로덕션 서버에서는 Prisma를 통한 DB 검증으로 치환 가능
        if (
          credentials?.username === "admin" &&
          credentials?.password === "1234"
        ) {
          return {
            id: "1",
            name: "Admin User",
            email: "admin@gs-ai.com",
            role: "ADMIN",
          };
        }
        
        // 인증 실패
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login', // 커스텀 로그인 페이지
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_key_for_development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
