import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import base64url from 'base64url';

import { TExtendedPrismaClient } from 'src/common/configs/prisma.config';
import {
  EDevicePlatform,
  EOAuthProvider,
  ETokenExpiration
} from 'src/common/constants/common.enum';
import { EProviderKey } from 'src/common/constants/provider-key.enum';
import { scrapeLinkMetadata } from 'src/common/utils/common.util';
import { LinkMetadata } from 'src/modules/apis/chat/dto/get-conversation-messages/GetConversationMessageResponse.dto';
import { RedisProvider } from 'src/modules/libs/redis/redis.provider';

@Injectable()
export class RedisService {
  constructor(
    private redis: RedisProvider,
    @Inject(EProviderKey.PRISMA_PROVIDER)
    private prismaService: TExtendedPrismaClient
  ) {}

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

  setFilePublicId = async (fileUrl: string, publicId: string) => {
    const encodeURL = base64url.encode(fileUrl);
    await this.redis.set(`file_public_id:${encodeURL}`, publicId);
  };

  getFilePublicId = async (fileUrl: string) => {
    const encodeURL = base64url.encode(fileUrl);
    const publicId = await this.redis.get(`file_public_id:${encodeURL}`);
    return publicId;
  };

  deleteFilePublicId = async (fileUrl: string) => {
    const encodeURL = base64url.encode(fileUrl);
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

  setDeviceToken = async (
    userId: string,
    token: string,
    platform: EDevicePlatform
  ) => {
    await this.redis.sadd(`device_token:${userId}:${platform}`, token);
  };

  getDeviceToken = async (
    userId: string,
    platform: EDevicePlatform | 'all'
  ) => {
    const platforms =
      platform === 'all' ? ['ios', 'android', 'web'] : [platform];
    const tokens = await Promise.all(
      platforms.map((platform) =>
        this.redis.smembers(`device_token:${userId}:${platform}`)
      )
    );
    return tokens.flat();
  };

  deleteDeviceToken = async (
    userId: string,
    token: string,
    platform: EDevicePlatform
  ) => {
    await this.redis.srem(`device_token:${userId}:${platform}`, token);
  };

  setInitOAuthPasswordToken = async (
    oAuthProvider: EOAuthProvider,
    email: string,
    token: string
  ) => {
    await this.redis.set(
      `init_oauth_password_token:${oAuthProvider}:${email}`,
      token,
      'EX',
      ETokenExpiration.INIT_OAUTH_PASSWORD_TOKEN
    );
  };

  getInitOAuthPasswordToken = async (
    oAuthProvider: EOAuthProvider,
    email: string
  ) => {
    const token = await this.redis.get(
      `init_oauth_password_token:${oAuthProvider}:${email}`
    );
    return token;
  };

  deleteInitOAuthPasswordToken = async (
    oAuthProvider: EOAuthProvider,
    email: string
  ) => {
    await this.redis.del(`init_oauth_password_token:${oAuthProvider}:${email}`);
  };

  setTwoFAToken = async (userId: string, token: string) => {
    await this.redis.set(
      `two_fa_token:${userId}`,
      token,
      'EX',
      ETokenExpiration.TWO_FACTOR_AUTH_TOKEN
    );
  };

  getTwoFAToken = async (userId: string) => {
    const token = await this.redis.get(`two_fa_token:${userId}`);
    return token;
  };

  deleteTwoFAToken = async (userId: string) => {
    await this.redis.del(`two_fa_token:${userId}`);
  };

  setLinkMetadata = async (url: string, metadata: LinkMetadata) => {
    const encodeURL = base64url.encode(url);
    await this.redis.set(
      `link_metadata:${encodeURL}`,
      JSON.stringify(metadata),
      'EX',
      60 * 60
    );
  };

  getLinkMetadata = async (url: string): Promise<LinkMetadata> => {
    const encodeURL = base64url.encode(url);
    const metadata = await this.redis.get(`link_metadata:${encodeURL}`);
    if (!metadata) {
      const linkMetadata = await scrapeLinkMetadata(url);
      await this.setLinkMetadata(url, linkMetadata);
      return linkMetadata;
    }
    return JSON.parse(metadata);
  };

  setConversationParticipantId = async (
    conversationId: string,
    userId: string,
    participantId: string
  ) => {
    await this.redis.set(
      `conversation_participant_id_mapping:${conversationId}:${userId}`,
      participantId
    );
  };

  getConversationParticipantId = async (
    conversationId: string,
    userId: string
  ) => {
    const participantId = await this.redis.get(
      `conversation_participant_id_mapping:${conversationId}:${userId}`
    );
    if (!participantId) {
      const userParticipant = await this.prismaService.conversationParticipant
        .findUniqueOrThrow({
          where: {
            userId_conversationId: {
              userId,
              conversationId
            }
          }
        })
        .catch(() => {
          throw new ForbiddenException(
            'You are not a participant in this conversation'
          );
        });
      await this.setConversationParticipantId(
        conversationId,
        userId,
        userParticipant.id
      );
      return userParticipant.id;
    }
    return participantId;
  };

  setUserLastOnlineAt = async (userId: string, lastOnlineAt: Date) => {
    await this.redis.set(
      `user_last_online_at:${userId}`,
      lastOnlineAt.toISOString()
    );
  };

  getUserLastOnlineAt = async (userId: string) => {
    const lastOnlineAt = await this.redis.get(`user_last_online_at:${userId}`);
    return lastOnlineAt ? new Date(lastOnlineAt) : null;
  };

  deleteUserLastOnlineAt = async (userId: string) => {
    await this.redis.del(`user_last_online_at:${userId}`);
  };
}
