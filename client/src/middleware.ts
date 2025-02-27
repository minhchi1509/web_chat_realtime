import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';

import { isRouteMatch } from 'src/utils/common.util';

const authMiddleware = withAuth({
  callbacks: {
    authorized: ({ token }) => !!token?.user.mainProfile
  }
});

const publicPath = ['/public']; // Page mà cả khi đăng nhập và không đăng nhập đều có thể truy cập
const unAuthenticatedPath = [
  '/signup',
  '/login',
  '/reset-password',
  '/forgot-password'
]; // Page mà khi đăng nhập rồi sẽ không thể truy cập

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const isAuthenticated = !!token?.user.mainProfile;
  const currentPathName = req.nextUrl.pathname;

  const isPublicPage = isRouteMatch(currentPathName, publicPath);
  const isUnAuthenticatedPage = isRouteMatch(
    currentPathName,
    unAuthenticatedPath
  );

  if (isPublicPage) {
    return null;
  }

  if (isUnAuthenticatedPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return null;
  }
  return (authMiddleware as any)(req);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
