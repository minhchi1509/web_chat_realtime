import { NextAuthOptions, User } from 'next-auth';
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        id: { type: 'text' },
        fullName: { type: 'text' },
        email: { type: 'text' },
        avatar: { type: 'text' },
        isEnableTwoFactorAuth: { type: 'boolean' },
        accessToken: { type: 'text' },
        refreshToken: { type: 'text' },
        expiresIn: { type: 'number' }
      },
      async authorize(credentials) {
        const user = {
          mainProfile: {
            id: credentials!.id,
            fullName: credentials!.fullName,
            email: credentials!.email,
            avatar: credentials!.avatar,
            isEnableTwoFactorAuth:
              credentials!.isEnableTwoFactorAuth === 'true' ? true : false,
            accessToken: credentials!.accessToken,
            refreshToken: credentials!.refreshToken,
            expiresIn: +credentials!.expiresIn
          }
        } as User;
        return user;
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })
  ],
  callbacks: {
    //"user" chính là giá trị trả về từ hàm "authorize" ở bên trên, "account", "profile" là thông tin trả về từ xác thực oauth như google, github, facebook,...
    async signIn({ user, account, profile }) {
      if (account?.type === 'oauth') {
        user.oAuthProfile = { ...account, ...profile };
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      //Hàm if dưới đây chỉ chạy 1 lần duy nhất khi user sign in
      //"user" là giá trị trả về từ hàm "signIn" ở bên trên
      if (user) {
        token.user = { ...user };
      }

      if (trigger === 'update') {
        token = { ...session };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as any;
      return session;
    }
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authOptions };
