import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Res
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';

import { ECookieName } from 'src/common/constants/common.enum';
import {
  ApiExceptionResponse,
  RequestHeaders
} from 'src/common/decorators/common.decorator';
import { PublicRoute } from 'src/common/decorators/metadata.decorator';
import { Cookies } from 'src/common/decorators/request-object.decorator';
import { MessageResponseDTO } from 'src/common/dto/MessageResponse.dto';
import { LoginBodyDTO } from 'src/modules/apis/auth/dto/login/LoginBody.dto';
import { LoginExceptionResponseDTO } from 'src/modules/apis/auth/dto/login/LoginExceptionResponse.dto';
import { LoginResponseDTO } from 'src/modules/apis/auth/dto/login/LoginResponse.dto';
import { RefreshTokenResponseDTO } from 'src/modules/apis/auth/dto/refresh-token/RefreshTokenResponse.dto';
import { ResetPasswordBodyDto } from 'src/modules/apis/auth/dto/reset-password/ResetPasswordBody.dto';
import { ResetPasswordHeadersDTO } from 'src/modules/apis/auth/dto/reset-password/ResetPasswordHeaders.dto';
import { ResetPasswordResponseDto } from 'src/modules/apis/auth/dto/reset-password/ResetPasswordResponse.dto';
import { SendResetPasswordMailBodyDto } from 'src/modules/apis/auth/dto/send-reset-password-mail/SendResetPasswordMailBody.dto';
import { SignupRequestDTO } from 'src/modules/apis/auth/dto/signup/SignupBody.dto';
import { SignupResponseDTO } from 'src/modules/apis/auth/dto/signup/SignupResponse.dto';
import { VerifyTwoFactorAuthBodyDTO } from 'src/modules/apis/auth/dto/verify-two-factor/VerifyTwoFactorBody.dto';
import { AuthService } from 'src/modules/apis/auth/services/auth.service';

@ApiTags('Auth')
@Controller('auth')
@PublicRoute()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiExceptionResponse()
  @Post('signup')
  async signup(@Body() body: SignupRequestDTO): Promise<SignupResponseDTO> {
    const response = await this.authService.signup(body);
    return plainToInstance(SignupResponseDTO, response);
  }

  @Post('login')
  @ApiExceptionResponse({
    type: LoginExceptionResponseDTO,
    status: HttpStatus.BAD_REQUEST
  })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginBodyDTO,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResponseDTO> {
    const response = await this.authService.login(body, res);
    return plainToInstance(LoginResponseDTO, response);
  }

  @ApiExceptionResponse()
  @Post('send-reset-password-mail')
  async sendResetPasswordMail(
    @Body() body: SendResetPasswordMailBodyDto
  ): Promise<MessageResponseDTO> {
    const response = await this.authService.sendResetPasswordMail(body.email);
    return plainToInstance(MessageResponseDTO, response);
  }

  @ApiExceptionResponse()
  @Put('reset-password')
  async resetPassword(
    @Body() body: ResetPasswordBodyDto,
    @RequestHeaders() headers: ResetPasswordHeadersDTO
  ): Promise<ResetPasswordResponseDto> {
    const response = await this.authService.resetPassword(body, headers);
    return plainToInstance(ResetPasswordResponseDto, response);
  }

  @ApiExceptionResponse()
  @Post('refresh-token')
  async refreshToken(
    @Cookies(ECookieName.REFRESH_TOKEN)
    refreshToken: string | undefined,
    @Res({ passthrough: true }) res: Response
  ): Promise<RefreshTokenResponseDTO> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    const response = await this.authService.refreshToken(refreshToken, res);
    return plainToInstance(RefreshTokenResponseDTO, response);
  }

  @ApiExceptionResponse()
  @Post('verify-two-factor-auth')
  async verifyTwoFactorAuth(
    @Body() body: VerifyTwoFactorAuthBodyDTO,
    @Cookies(ECookieName.TWO_FACTOR_AUTH_TOKEN)
    twoFactorAuthToken: string | undefined,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResponseDTO> {
    if (!twoFactorAuthToken) {
      throw new BadRequestException(
        'Two factor authentication token is required'
      );
    }
    const response = await this.authService.verifyTwoFactorAuth(
      twoFactorAuthToken,
      body,
      res
    );
    return plainToInstance(LoginResponseDTO, response);
  }
}
