import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

import {
  ECookieName,
  ETokenExpiration
} from 'src/common/constants/common.enum';
import { IEnvironmentVariables } from 'src/common/types/env.type';
import {
  TJWTOAuthPayload,
  TJWTPayload,
  TJWTResetPasswordPayload,
  TJWTTwoFactorAuthPayload,
  TSignTokenResponse
} from 'src/common/types/token.type';
import { CookiesService } from 'src/modules/libs/cookies/cookies.service';
import { RedisService } from 'src/modules/libs/redis/redis.service';

@Injectable()
export class TokenService {
  constructor(
    private configService: ConfigService<IEnvironmentVariables>,
    private jwtService: JwtService,
    private redisService: RedisService,
    private cookiesService: CookiesService
  ) {}

  signAccessToken = async (payload: TJWTPayload) => {
    const accessTokenResponse = await this.signToken(
      payload,
      this.configService.get<string>('ACCESS_TOKEN_SECRET') || '',
      ETokenExpiration.ACCESS_TOKEN
    );
    return accessTokenResponse;
  };

  signRefreshToken = async (payload: TJWTPayload) => {
    const refreshTokenResponse = await this.signToken(
      payload,
      this.configService.get<string>('REFRESH_TOKEN_SECRET') || '',
      ETokenExpiration.REFRESH_TOKEN
    );
    return refreshTokenResponse;
  };

  signResetPasswordToken = async (
    payload: TJWTResetPasswordPayload
  ): Promise<string> => {
    const resetPasswordTokenResponse = await this.signToken(
      payload,
      this.configService.get<string>('RESET_PASSWORD_TOKEN_SECRET') || '',
      ETokenExpiration.RESET_PASSWORD_TOKEN
    );
    return resetPasswordTokenResponse.token;
  };

  signOAuthPayloadToken = async (
    payload: TJWTOAuthPayload
  ): Promise<string> => {
    return this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('INIT_OAUTH_PASSWORD_TOKEN_SECRET') ||
        '',
      expiresIn: ETokenExpiration.INIT_OAUTH_PASSWORD_TOKEN
    });
  };

  signTwoFactorAuthToken = async (
    payload: TJWTTwoFactorAuthPayload
  ): Promise<string> => {
    return this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('TWO_FACTOR_AUTH_TOKEN_SECRET') || '',
      expiresIn: ETokenExpiration.TWO_FACTOR_AUTH_TOKEN
    });
  };

  verifyAccessToken = async (token: string): Promise<TJWTPayload | null> => {
    const decodeAccessToken = await this.verifyToken<TJWTPayload>(
      token,
      this.configService.get<string>('ACCESS_TOKEN_SECRET') || ''
    );
    return decodeAccessToken;
  };

  verifyRefreshToken = async (token: string): Promise<TJWTPayload | null> => {
    const decodeRefreshToken = await this.verifyToken<TJWTPayload>(
      token,
      this.configService.get<string>('REFRESH_TOKEN_SECRET') || ''
    );
    return decodeRefreshToken;
  };

  verifyResetPasswordToken = async (
    token: string
  ): Promise<TJWTResetPasswordPayload | null> => {
    const decodeResetPasswordToken =
      await this.verifyToken<TJWTResetPasswordPayload>(
        token,
        this.configService.get<string>('RESET_PASSWORD_TOKEN_SECRET') || ''
      );
    return decodeResetPasswordToken;
  };

  verifyInitOAuthPasswordToken = async (
    token: string
  ): Promise<TJWTOAuthPayload | null> => {
    const decodeOAuthPayloadToken = await this.verifyToken<TJWTOAuthPayload>(
      token,
      this.configService.get<string>('INIT_OAUTH_PASSWORD_TOKEN_SECRET') || ''
    );
    return decodeOAuthPayloadToken;
  };

  verifyTwoFactorAuthToken = async (
    token: string
  ): Promise<TJWTTwoFactorAuthPayload | null> => {
    const decodeTwoFactorAuthToken =
      await this.verifyToken<TJWTTwoFactorAuthPayload>(
        token,
        this.configService.get<string>('TWO_FACTOR_AUTH_TOKEN_SECRET') || ''
      );
    return decodeTwoFactorAuthToken;
  };

  createAccessTokenAndRefreshToken = async (
    payload: TJWTPayload,
    res: Response
  ) => {
    const { token: accessToken, expiresIn: accessTokenExpires } =
      await this.signAccessToken(payload);
    const { token: refreshToken, expiresIn: refreshTokenExpires } =
      await this.signRefreshToken(payload);

    await this.redisService.setUserRefreshToken(payload.sub, refreshToken);

    this.cookiesService.setCookie(res, ECookieName.ACCESS_TOKEN, accessToken, {
      expires: new Date(accessTokenExpires) // Add 60 seconds to the access token expiration for cookie
    });
    this.cookiesService.setCookie(
      res,
      ECookieName.REFRESH_TOKEN,
      refreshToken,
      {
        expires: new Date(refreshTokenExpires) // Add 60 seconds to the refresh token expiration for cookie
      }
    );
  };

  private signToken = async <T extends object>(
    payload: T,
    secret: string,
    expiresIn: number
  ): Promise<TSignTokenResponse> => {
    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn
    });
    const expiredTime = new Date().getTime() + expiresIn * 1000;
    return { token, expiresIn: expiredTime };
  };

  private verifyToken = async <T extends object>(
    token: string,
    secret: string
  ): Promise<T | null> => {
    try {
      const payload = await this.jwtService.verifyAsync<T>(token, { secret });
      return payload;
    } catch (_error) {
      return null;
    }
  };
}
