import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ETokenExpiration } from 'src/common/constants/common.enum';
import { IEnvironmentVariables } from 'src/common/types/env.type';
import {
  TJWTPayload,
  TJWTResetPasswordPayload,
  TSignTokenResponse
} from 'src/common/types/token.type';

@Injectable()
export class TokenService {
  constructor(
    private configService: ConfigService<IEnvironmentVariables>,
    private jwtService: JwtService
  ) {}

  signAccessToken = async (payload: TJWTPayload) => {
    const accessTokenResponse = await this.signToken(
      payload,
      this.configService.get<string>('ACCESS_TOKEN_SECRET') || '',
      ETokenExpiration.ACCESS_TOKEN
    );
    return accessTokenResponse;
  };

  signRefreshToken = async (payload: TJWTPayload): Promise<string> => {
    const refreshTokenResponse = await this.signToken(
      payload,
      this.configService.get<string>('REFRESH_TOKEN_SECRET') || '',
      ETokenExpiration.REFRESH_TOKEN
    );
    return refreshTokenResponse.token;
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
    } catch (error) {
      return null;
    }
  };
}
