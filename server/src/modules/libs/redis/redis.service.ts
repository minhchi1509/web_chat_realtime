import { Injectable } from '@nestjs/common';

import { ETokenExpiration } from 'src/common/constants/common.enum';
import { RedisProvider } from 'src/modules/libs/redis/redis.provider';

@Injectable()
export class RedisService {
  constructor(private redis: RedisProvider) {}

  setResetPasswordToken = async (email: string, token: string) => {
    await this.redis.set(
      `reset_password_token:${email}`,
      token,
      'EX',
      ETokenExpiration.RESET_PASSWORD_TOKEN
    );
  };

  deleteResetPasswordToken = async (email: string) => {
    await this.redis.del(`reset_password_token:${email}`);
  };

  getResetPasswordToken = async (email: string) => {
    const token = await this.redis.get(`reset_password_token:${email}`);
    return token;
  };

  setUserRefreshToken = async (userId: string, refreshToken: string) => {
    await this.redis.set(
      `refresh_token:${userId}`,
      refreshToken,
      'EX',
      ETokenExpiration.REFRESH_TOKEN
    );
  };

  getUserRefreshToken = async (userId: string) => {
    const refreshToken = await this.redis.get(`refresh_token:${userId}`);
    return refreshToken;
  };

  deleteUserRefreshToken = async (userId: string) => {
    await this.redis.del(`refresh_token:${userId}`);
  };

  setFilePublicId = async (encodeURL: string, publicId: string) => {
    await this.redis.set(`file_public_id:${encodeURL}`, publicId);
  };

  getFilePublicId = async (encodeURL: string) => {
    const publicId = await this.redis.get(`file_public_id:${encodeURL}`);
    return publicId;
  };

  deleteFilePublicId = async (encodeURL: string) => {
    await this.redis.del(`file_public_id:${encodeURL}`);
  };

  setTwoFASecretKey = async (userId: string, secretKey: string) => {
    await this.redis.set(`two_fa_secret_key:${userId}`, secretKey);
  };

  getTwoFASecretKey = async (userId: string) => {
    const secretKey = await this.redis.get(`two_fa_secret_key:${userId}`);
    return secretKey;
  };

  deleteTwoFASecretKey = async (userId: string) => {
    await this.redis.del(`two_fa_secret_key:${userId}`);
  };

  setUserSocketId = async (userId: string, socketId: string) => {
    await this.redis.sadd(`socket_id:${userId}`, socketId);
  };

  getUserSocketId = async (userId: string) => {
    const socketId = await this.redis.smembers(`socket_id:${userId}`);
    return socketId;
  };

  deleteUserSocketId = async (userId: string, socketId: string) => {
    await this.redis.srem(`socket_id:${userId}`, socketId);
  };

  deleteAllSocketId = async () => {
    let cursor = '0';
    do {
      const [newCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        'socket_id:*',
        'COUNT',
        100
      );
      cursor = newCursor;
      if (keys.length) {
        await this.redis.del(...keys);
      }
    } while (cursor !== '0');
  };
}
