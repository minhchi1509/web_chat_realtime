import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { authenticator } from 'otplib';

import { TExtendedPrismaClient } from 'src/common/configs/prisma.config';
import { DEFAULT_USER_AVATAR_URL } from 'src/common/constants/common.constant';
import {
  ECookieName,
  ELoginExceptionErrorType,
  ETokenExpiration
} from 'src/common/constants/common.enum';
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
import { RefreshTokenResponseDTO } from 'src/modules/apis/auth/dto/refresh-token/RefreshTokenResponse.dto';
import { ResetPasswordBodyDto } from 'src/modules/apis/auth/dto/reset-password/ResetPasswordBody.dto';
import { ResetPasswordHeadersDTO } from 'src/modules/apis/auth/dto/reset-password/ResetPasswordHeaders.dto';
import { ResetPasswordResponseDto } from 'src/modules/apis/auth/dto/reset-password/ResetPasswordResponse.dto';
import { SignupRequestDTO } from 'src/modules/apis/auth/dto/signup/SignupBody.dto';
import { SignupResponseDTO } from 'src/modules/apis/auth/dto/signup/SignupResponse.dto';
import { VerifyTwoFactorAuthBodyDTO } from 'src/modules/apis/auth/dto/verify-two-factor/VerifyTwoFactorBody.dto';
import { LoginException } from 'src/modules/apis/auth/exceptions/LoginException';
import { BcryptService } from 'src/modules/libs/bcrypt/bcrypt.service';
import { CookiesService } from 'src/modules/libs/cookies/cookies.service';
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
    private redisService: RedisService,
    private cookiesService: CookiesService
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

  login = async (
    body: LoginBodyDTO,
    res: Response
  ): Promise<LoginResponseDTO> => {
    const { email, password } = body;
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
      const twoFAPayloadToken = await this.tokenService.signTwoFactorAuthToken({
        userId: user.id,
        email: user.email
      });

      this.cookiesService.setCookie(
        res,
        ECookieName.TWO_FACTOR_AUTH_TOKEN,
        twoFAPayloadToken,
        {
          expires: new Date(
            Date.now() + ETokenExpiration.TWO_FACTOR_AUTH_TOKEN * 1000
          )
        }
      );

      await this.redisService.setTwoFAToken(user.id, twoFAPayloadToken);

      throw new LoginException({
        message: 'Two factor authenticator code is required',
        errorType: ELoginExceptionErrorType.REQUIRED_2FA_OTP
      });
    }

    const jwtPayload: TJWTPayload = { sub: user.id, email: user.email };
    await this.tokenService.createAccessTokenAndRefreshToken(jwtPayload, res);

    return { user };
  };

  verifyTwoFactorAuth = async (
    token: string,
    body: VerifyTwoFactorAuthBodyDTO,
    res: Response
  ): Promise<LoginResponseDTO> => {
    const decodedTwoFactorAuthToken =
      await this.tokenService.verifyTwoFactorAuthToken(token);

    if (!decodedTwoFactorAuthToken) {
      throw new BadRequestException('Invalid two factor authenticator token');
    }

    const { userId, email } = decodedTwoFactorAuthToken;

    const twoFactorAuthToken = await this.redisService.getTwoFAToken(userId);
    if (!twoFactorAuthToken) {
      throw new BadRequestException('Invalid two factor authenticator token');
    }

    const { otpCode } = body;

    const user = await this.prismaService.user
      .findFirstOrThrow({
        where: { id: userId, email }
      })
      .catch(() => {
        throw new NotFoundException('User not found');
      });

    if (!user.isEnableTwoFactorAuth) {
      throw new BadRequestException('Two factor authentication is not enabled');
    }

    const twofaSecretKey = await this.redisService.getTwoFASecretKey(userId);
    if (!twofaSecretKey) {
      throw new Error(
        `Can not find 2FA secret key of user with id: ${userId} in database`
      );
    }
    const isValidOtp = authenticator.verify({
      secret: twofaSecretKey,
      token: otpCode
    });

    if (!isValidOtp) {
      throw new BadRequestException('Two factor authenticator code is invalid');
    }

    const jwtPayload: TJWTPayload = { sub: user.id, email: user.email };
    await this.tokenService.createAccessTokenAndRefreshToken(jwtPayload, res);
    await this.redisService.deleteTwoFAToken(userId);

    this.cookiesService.clearCookie(res, ECookieName.TWO_FACTOR_AUTH_TOKEN);

    return { user };
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
    const resetPasswordUrl = `${this.configService.get<string>('CLIENT_URL')}/reset-password?type=reset&token=${resetPasswordToken}`;

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
    body: ResetPasswordBodyDto,
    headers: ResetPasswordHeadersDTO
  ): Promise<ResetPasswordResponseDto> => {
    const { newPassword } = body;
    const { token } = headers;
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

  refreshToken = async (
    refreshToken: string,
    res: Response
  ): Promise<RefreshTokenResponseDTO> => {
    const decodeRefreshToken =
      await this.tokenService.verifyRefreshToken(refreshToken);

    if (!decodeRefreshToken) {
      this.cookiesService.clearAuthCookies(res);
      throw new BadRequestException('Invalid refresh token');
    }

    const userRefreshToken = await this.redisService.getUserRefreshToken(
      decodeRefreshToken.sub
    );
    if (!userRefreshToken || userRefreshToken !== refreshToken) {
      this.cookiesService.clearAuthCookies(res);
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

    await this.tokenService.createAccessTokenAndRefreshToken(payload, res);

    return {
      message: 'Refresh token successfully',
      user
    };
  };
}
