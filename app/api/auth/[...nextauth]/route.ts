import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";

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
          // DB에 관리자 사용자가 없으면 자동 생성 (외래키 제약조건 오류 방지)
          try {
            await prisma.user.upsert({
              where: { id: "1" },
              update: {},
              create: {
                id: "1",
                name: "Admin User",
                email: "admin@gs-ai.com",
                role: "ADMIN",
              }
            });
          } catch (e) {
            console.error("Failed to upsert admin user", e);
          }

          return {
            id: "1",
            name: "Admin User",
            email: "admin@gs-ai.com",
            role: "ADMIN",
          };
        }
        
        // 사내 전용 일반 직원 공용 계정 적용
        if (
          credentials?.username === "gs_staff" &&
          credentials?.password === "1234"
        ) {
          try {
            await prisma.user.upsert({
              where: { id: "2" },
              update: {},
              create: {
                id: "2",
                name: "GS Staff",
                email: "staff@gsretail.com",
                role: "USER",
              }
            });
          } catch (e) {
            console.error("Failed to upsert staff user", e);
          }

          return {
            id: "2",
            name: "GS Staff",
            email: "staff@gsretail.com",
            role: "USER",
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
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.role = token.role as string;
        // @ts-ignore
        session.user.id = (token.id || token.sub) as string;
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
