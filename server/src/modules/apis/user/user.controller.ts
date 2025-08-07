import { Body, Controller, Get, Post, Put, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';

import {
  ApiExceptionResponse,
  UseFormData
} from 'src/common/decorators/common.decorator';
import { UserId } from 'src/common/decorators/request-object.decorator';
import { MessageResponseDTO } from 'src/common/dto/MessageResponse.dto';
import { UserResponseDTO } from 'src/common/dto/UserResponse.dto';
import { DisabledTwoFABodyDTO } from 'src/modules/apis/user/dto/2fa/DisabledTwoFABody.dto';
import { EnableTwoFABodyDTO } from 'src/modules/apis/user/dto/2fa/EnableTwoFABody.dto';
import { GenerateTwoFAResponseDTO } from 'src/modules/apis/user/dto/2fa/GenerateTwoFAResponse.dto';
import { ModifyTwoFAResponseDTO } from 'src/modules/apis/user/dto/2fa/ModifyTwoFAResponse.dto';
import { ChangePasswordBodyDTO } from 'src/modules/apis/user/dto/change-password/ChangePasswordBody.dto';
import { UpdateProfileBodyDTO } from 'src/modules/apis/user/dto/update-profile/UpdateProfileBody.dto';
import { UpdateProfileResponseDTO } from 'src/modules/apis/user/dto/update-profile/UpdateProfileResponse.dto';
import { UserService } from 'src/modules/apis/user/user.service';

@ApiTags('User')
@ApiExceptionResponse()
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  async profile(@UserId() userId: string): Promise<UserResponseDTO> {
    const response = await this.userService.getProfile(userId);
    return plainToInstance(UserResponseDTO, response);
  }

  @Put('profile')
  @UseFormData()
  async editProfile(
    @Body() body: UpdateProfileBodyDTO,
    @UserId() userId: string
  ): Promise<UpdateProfileResponseDTO> {
    const response = await this.userService.editProfile(userId, body);
    return plainToInstance(UpdateProfileResponseDTO, response);
  }

  @Put('password')
  async changePassword(
    @Body() body: ChangePasswordBodyDTO,
    @UserId() userId: string
  ): Promise<MessageResponseDTO> {
    const response = await this.userService.changePassword(userId, body);
    return plainToInstance(MessageResponseDTO, response);
  }

  @Get('generate-2fa')
  async generateTwoFA(
    @UserId() userId: string
  ): Promise<GenerateTwoFAResponseDTO> {
    const response = await this.userService.generateTwoFA(userId);
    return plainToInstance(GenerateTwoFAResponseDTO, response);
  }

  @Put('enable-2fa')
  async enableTwoFA(
    @UserId() userId: string,
    @Body() body: EnableTwoFABodyDTO
  ): Promise<ModifyTwoFAResponseDTO> {
    const { otpCode } = body;
    const response = await this.userService.enableTwoFA(userId, otpCode);
    return plainToInstance(ModifyTwoFAResponseDTO, response);
  }

  @Put('disable-2fa')
  async disableTwoFA(
    @Body() body: DisabledTwoFABodyDTO,
    @UserId() userId: string
  ): Promise<ModifyTwoFAResponseDTO> {
    const response = await this.userService.disableTwoFA(body, userId);
    return plainToInstance(ModifyTwoFAResponseDTO, response);
  }

  @Post('logout')
  async logout(
    @UserId() userId: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<MessageResponseDTO> {
    const response = await this.userService.logout(userId, res);
    return plainToInstance(MessageResponseDTO, response);
  }
}
