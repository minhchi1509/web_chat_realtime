import { NextRequest, NextResponse } from 'next/server';

import { isRouteMatch } from 'src/utils/common.util';

const publicPath = ['/public']; // Page mà cả khi đăng nhập và không đăng nhập đều có thể truy cập
const unAuthenticatedPath = [
  '/signup',
  '/login',
  '/reset-password',
  '/forgot-password',
  '/two-factor-auth'
]; // Page mà khi đăng nhập rồi sẽ không thể truy cập

export default async function middleware(req: NextRequest) {
  // Kiểm tra sự tồn tại của refresh_token trong cookies
  const refreshToken = req.cookies.get('refresh_token');
  const isAuthenticated = !!refreshToken;

  const currentPathName = req.nextUrl.pathname;

  const isPublicPage = isRouteMatch(currentPathName, publicPath);
  const isUnAuthenticatedPage = isRouteMatch(
    currentPathName,
    unAuthenticatedPath
  );

  // Cho phép truy cập các trang công khai không cần xác thực
  if (isPublicPage) {
    return null;
  }

  // Xử lý các trang không yêu cầu xác thực (đã đăng nhập sẽ chuyển hướng)
  if (isUnAuthenticatedPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return null;
  }

  // Xử lý các trang yêu cầu xác thực
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Cho phép truy cập trang yêu cầu xác thực khi đã đăng nhập
  return null;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
