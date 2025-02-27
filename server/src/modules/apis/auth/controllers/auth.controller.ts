import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { ApiExceptionResponse } from 'src/common/decorators/common.decorator';
import { PublicRoute } from 'src/common/decorators/metadata.decorator';
import { MessageResponseDTO } from 'src/common/dto/MessageResponse.dto';
import { LoginBodyDTO } from 'src/modules/apis/auth/dto/login/LoginBody.dto';
import { LoginExceptionResponseDTO } from 'src/modules/apis/auth/dto/login/LoginExceptionResponse.dto';
import { LoginResponseDTO } from 'src/modules/apis/auth/dto/login/LoginResponse.dto';
import { RefreshTokenBodyDTO } from 'src/modules/apis/auth/dto/refresh-token/RefreshTokenBody.dto';
import { ResetPasswordBodyDto } from 'src/modules/apis/auth/dto/reset-password/ResetPasswordBody.dto';
import { ResetPasswordResponseDto } from 'src/modules/apis/auth/dto/reset-password/ResetPasswordResponse.dto';
import { SendResetPasswordMailBodyDto } from 'src/modules/apis/auth/dto/send-reset-password-mail/SendResetPasswordMailBody.dto';
import { SignupRequestDTO } from 'src/modules/apis/auth/dto/signup/SignupBody.dto';
import { SignupResponseDTO } from 'src/modules/apis/auth/dto/signup/SignupResponse.dto';
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
  async login(@Body() body: LoginBodyDTO): Promise<LoginResponseDTO> {
    const response = await this.authService.login(body);
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
    @Body() body: ResetPasswordBodyDto
  ): Promise<ResetPasswordResponseDto> {
    const response = await this.authService.resetPassword(body);
    return plainToInstance(ResetPasswordResponseDto, response);
  }

  @ApiExceptionResponse()
  @Post('refresh-token')
  async refreshToken(
    @Body() body: RefreshTokenBodyDTO
  ): Promise<LoginResponseDTO> {
    const { refreshToken } = body;
    const response = await this.authService.refreshToken(refreshToken);
    return plainToInstance(LoginResponseDTO, response);
  }
}
