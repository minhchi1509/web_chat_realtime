import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { ApiExceptionResponse } from 'src/common/decorators/common.decorator';
import { PublicRoute } from 'src/common/decorators/metadata.decorator';
import { UserId } from 'src/common/decorators/request-object.decorator';
import { MessageResponseDTO } from 'src/common/dto/MessageResponse.dto';
import { SubscribeNotificationBodyDTO } from 'src/modules/apis/notification/dto/subscribe/SubscribeNotificationBody.dto';
import { TestSendNotificationBodyDTO } from 'src/modules/apis/notification/dto/test-send-notification/TestSendNotificationBody.dto';
import { NotificationService } from 'src/modules/apis/notification/notification.service';

@ApiTags('Notification')
@Controller('notification')
@ApiExceptionResponse()
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('subscribe')
  async subscribeNotification(
    @Body() body: SubscribeNotificationBodyDTO,
    @UserId() userId: string
  ): Promise<MessageResponseDTO> {
    const response =
      await this.notificationService.subscribeOrUnSubscribeNotification(
        userId,
        body,
        'SUBSCRIBE'
      );
    return plainToInstance(MessageResponseDTO, response);
  }

  @Post('unsubscribe')
  @ApiBearerAuth()
  async unsubscribeNotification(
    @UserId() userId: string,
    @Body() body: SubscribeNotificationBodyDTO
  ): Promise<MessageResponseDTO> {
    const response =
      await this.notificationService.subscribeOrUnSubscribeNotification(
        userId,
        body,
        'UNSUBSCRIBE'
      );
    return plainToInstance(MessageResponseDTO, response);
  }

  @Post('send')
  @PublicRoute()
  async sendNotification(
    @Body() body: TestSendNotificationBodyDTO
  ): Promise<MessageResponseDTO> {
    const { platform, toUserId, ...notificationPayload } = body;
    const response = await this.notificationService.sendNotification(
      [toUserId],
      platform,
      notificationPayload
    );
    return plainToInstance(MessageResponseDTO, response);
  }
}
