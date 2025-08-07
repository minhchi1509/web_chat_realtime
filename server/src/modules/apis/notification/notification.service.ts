import { Injectable } from '@nestjs/common';
import admin from 'firebase-admin';

import { EDevicePlatform } from 'src/common/constants/common.enum';
import { MessageResponseDTO } from 'src/common/dto/MessageResponse.dto';
import { SendNotificationPayloadDTO } from 'src/common/dto/SendNotificationPayload.dto';
import { SubscribeNotificationBodyDTO } from 'src/modules/apis/notification/dto/subscribe/SubscribeNotificationBody.dto';
import { RedisService } from 'src/modules/libs/redis/redis.service';

@Injectable()
export class NotificationService {
  constructor(private redis: RedisService) {}

  subscribeOrUnSubscribeNotification = async (
    userId: string,
    body: SubscribeNotificationBodyDTO,
    type: 'SUBSCRIBE' | 'UNSUBSCRIBE'
  ): Promise<MessageResponseDTO> => {
    const { deviceToken, platform } = body;
    if (type === 'SUBSCRIBE') {
      await this.redis.setDeviceToken(userId, deviceToken, platform);
    } else {
      await this.redis.deleteDeviceToken(userId, deviceToken, platform);
    }
    return { message: 'Successfully subscribed to notification' };
  };

  sendNotification = async (
    toUsersId: string[],
    platform: EDevicePlatform | 'all',
    payload: SendNotificationPayloadDTO
  ): Promise<MessageResponseDTO> => {
    const allTokens = (
      await Promise.all(
        toUsersId.map((userId) => this.redis.getDeviceToken(userId, platform))
      )
    ).flat();
    const tokens = allTokens.filter((token) => token);
    if (tokens.length === 0) {
      return { message: 'No device token found' };
    }
    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: {
        launchUrl: payload.launchUrl || ''
      }
    });
    return { message: 'Notification sent' };
  };
}
