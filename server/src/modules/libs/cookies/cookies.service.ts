import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';

import { ECookieName } from 'src/common/constants/common.enum';

@Injectable()
export class CookiesService {
  constructor(private readonly configService: ConfigService) {}

  setCookie = (
    res: Response,
    cookieName: ECookieName,
    cookieValue: string,
    options?: CookieOptions
  ) => {
    const isProduction =
      this.configService.get<'development' | 'production'>('NODE_ENV') ===
      'production';

    const productionCookieOptions: CookieOptions = {
      secure: true,
      sameSite: 'strict',
      domain: 'web-chat.minhchi.id.vn'
    };

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      path: '/',
      ...options,
      ...(!isProduction ? {} : productionCookieOptions)
    };

    res.cookie(cookieName, cookieValue, cookieOptions);
  };

  clearCookie = (res: Response, cookieName: ECookieName) => {
    const isProduction =
      this.configService.get<'development' | 'production'>('NODE_ENV') ===
      'production';

    const productionCookieOptions: CookieOptions = {
      secure: true,
      sameSite: 'strict',
      domain: 'web-chat.minhchi.id.vn'
    };

    res.clearCookie(cookieName, {
      httpOnly: true,
      path: '/',
      ...(!isProduction ? {} : productionCookieOptions)
    });
  };

  clearAuthCookies = (res: Response) => {
    this.clearCookie(res, ECookieName.ACCESS_TOKEN);
    this.clearCookie(res, ECookieName.REFRESH_TOKEN);
  };
}
