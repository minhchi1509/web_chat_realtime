import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';

import { TExtendedPrismaClient } from 'src/common/configs/prisma.config';
import { DEFAULT_USER_AVATAR_URL } from 'src/common/constants/common.constant';
import { ELoginExceptionErrorType } from 'src/common/constants/common.enum';
import { EProviderKey } from 'src/common/constants/provider-key.enum';
import { MessageResponseDTO } from 'src/common/dto/MessageResponse.dto';
import { IEnvironmentVariables } from 'src/common/types/env.type';
import { TResetPasswordMailData } from 'src/common/types/mail.type';
import {
  TJWTPayload,
  TJWTResetPasswordPayload
} from 'src/common/types/token.type';
import { LoginBodyDTO } from 'src/modules/apis/auth/dto/login/LoginBody.dto';
import { LoginResponseDTO } from 'src/modules/apis/auth/dto/login/LoginResponse.dto';
import { ResetPasswordBodyDto } from 'src/modules/apis/auth/dto/reset-password/ResetPasswordBody.dto';
import { ResetPasswordResponseDto } from 'src/modules/apis/auth/dto/reset-password/ResetPasswordResponse.dto';
import { SignupRequestDTO } from 'src/modules/apis/auth/dto/signup/SignupBody.dto';
import { SignupResponseDTO } from 'src/modules/apis/auth/dto/signup/SignupResponse.dto';
import { LoginException } from 'src/modules/apis/auth/exceptions/LoginException';
import { BcryptService } from 'src/modules/libs/bcrypt/bcrypt.service';
import { MailQueueService } from 'src/modules/libs/job-queue/mail-queue/providers/mail-queue.service';
import { RedisService } from 'src/modules/libs/redis/redis.service';
import { TokenService } from 'src/modules/libs/token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService<IEnvironmentVariables>,
    @Inject(EProviderKey.PRISMA_PROVIDER)
    private prismaService: TExtendedPrismaClient,
    private tokenService: TokenService,
    private bcryptService: BcryptService,
    private mailQueueService: MailQueueService,
    private redisService: RedisService
  ) {}

  signup = async (data: SignupRequestDTO): Promise<SignupResponseDTO> => {
    const { fullName, email, password } = data;
    const isEmailExists = !!(await this.prismaService.user.findFirst({
      where: { email }
    }));
    if (isEmailExists) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await this.bcryptService.hash(password);
    const createdUser = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        avatar: DEFAULT_USER_AVATAR_URL
      }
    });

    return { ...createdUser };
  };

  login = async (body: LoginBodyDTO): Promise<LoginResponseDTO> => {
    const { email, password, otpCode } = body;
    const user = await this.prismaService.user
      .findFirstOrThrow({
        where: { email }
      })
      .catch(() => {
        throw new LoginException({
          message: 'Email is not associated with any account',
          errorType: ELoginExceptionErrorType.INVALID_CREDENTIALS
        });
      });

    if (!user.password) {
      throw new LoginException({
        message: 'Account has no password. Login with OAuth instead',
        errorType: ELoginExceptionErrorType.INVALID_CREDENTIALS
      });
    }

    const isPasswordMatched = await this.bcryptService.isMatch(
      password,
      user.password
    );
    if (!isPasswordMatched) {
      throw new LoginException({
        message: 'Wrong password',
        errorType: ELoginExceptionErrorType.INVALID_CREDENTIALS
      });
    }

    if (user.isEnableTwoFactorAuth) {
      if (!otpCode) {
        throw new LoginException({
          message: 'Two factor authenticator code is required',
          errorType: ELoginExceptionErrorType.REQUIRED_2FA_OTP
        });
      }
      const twofaSecretKey = await this.redisService.getTwoFASecretKey(user.id);
      if (!twofaSecretKey) {
        throw new Error(
          `Can not find 2FA secret key of user with id: ${user.id} in database`
        );
      }
      const isValidOtp = authenticator.verify({
        secret: twofaSecretKey,
        token: otpCode
      });

      if (!isValidOtp) {
        throw new LoginException({
          message: 'Two factor authenticator code is invalid',
          errorType: ELoginExceptionErrorType.INVALID_2FA_OTP
        });
      }
    }

    const jwtPayload: TJWTPayload = { sub: user.id, email: user.email };
    const { token: accessToken, expiresIn } =
      await this.tokenService.signAccessToken(jwtPayload);
    const refreshToken = await this.tokenService.signRefreshToken(jwtPayload);

    await this.redisService.setUserRefreshToken(user.id, refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn
    };
  };

  sendResetPasswordMail = async (
    email: string
  ): Promise<MessageResponseDTO> => {
    const user = await this.prismaService.user
      .findUniqueOrThrow({ where: { email } })
      .catch(() => {
        throw new NotFoundException('Email is not associated with any account');
      });

    const currentResetPasswordToken =
      await this.redisService.getResetPasswordToken(email);
    if (currentResetPasswordToken) {
      throw new BadRequestException(
        'A reset password mail has been sent to your email already. Please check your email or try again after 5 minutes'
      );
    }

    const resetPasswordTokenPayload: TJWTResetPasswordPayload = {
      email
    };
    const resetPasswordToken = await this.tokenService.signResetPasswordToken(
      resetPasswordTokenPayload
    );
    const resetPasswordUrl = `${this.configService.get<string>('CLIENT_URL')}/reset-password?reset_password_token=${resetPasswordToken}`;

    const resetPasswordMailData: TResetPasswordMailData = {
      to: email,
      context: {
        name: user.fullName,
        reset_link: resetPasswordUrl
      }
    };
    await this.redisService.setResetPasswordToken(email, resetPasswordToken);
    await this.mailQueueService.sendResetPasswordMail(resetPasswordMailData);
    return {
      message: 'A reset password mail has been sent to your email successfully!'
    };
  };

  resetPassword = async (
    body: ResetPasswordBodyDto
  ): Promise<ResetPasswordResponseDto> => {
    const { token, newPassword } = body;
    const decodeResetPasswordToken =
      await this.tokenService.verifyResetPasswordToken(token);
    if (!decodeResetPasswordToken) {
      throw new BadRequestException('Reset password link is expired');
    }
    const resetPasswordToken = await this.redisService.getResetPasswordToken(
      decodeResetPasswordToken.email
    );
    if (!resetPasswordToken) {
      throw new BadRequestException('Reset password link is expired');
    }
    const hashedPassword = await this.bcryptService.hash(newPassword);
    const updatedUser = await this.prismaService.user.update({
      where: { email: decodeResetPasswordToken.email },
      data: {
        password: hashedPassword
      }
    });

    await this.redisService.deleteResetPasswordToken(
      decodeResetPasswordToken.email
    );

    return {
      message: 'Reset password successfully',
      user: updatedUser
    };
  };

  refreshToken = async (refreshToken: string): Promise<LoginResponseDTO> => {
    const decodeRefreshToken =
      await this.tokenService.verifyRefreshToken(refreshToken);

    if (!decodeRefreshToken) {
      throw new BadRequestException('Invalid refresh token');
    }

    const userRefreshToken = await this.redisService.getUserRefreshToken(
      decodeRefreshToken.sub
    );
    if (!userRefreshToken || userRefreshToken !== refreshToken) {
      throw new BadRequestException('Invalid refresh token');
    }

    const payload: TJWTPayload = {
      sub: decodeRefreshToken.sub,
      email: decodeRefreshToken.email
    };
    const userId = decodeRefreshToken.sub;

    const user = await this.prismaService.user
      .findUniqueOrThrow({
        where: { id: userId }
      })
      .catch(() => {
        throw new NotFoundException('User not found');
      });

    const { token: newAccessToken, expiresIn } =
      await this.tokenService.signAccessToken(payload);
    const newRefreshToken = await this.tokenService.signRefreshToken(payload);

    await this.redisService.setUserRefreshToken(userId, newRefreshToken);

    return {
      user,
      accessToken: newAccessToken,
      expiresIn,
      refreshToken: newRefreshToken
    };
  };
}
