import { Inject, Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';

import { TExtendedPrismaClient } from 'src/common/configs/prisma.config';
import { ELoginExceptionErrorType } from 'src/common/constants/common.enum';
import { EProviderKey } from 'src/common/constants/provider-key.enum';
import { TJWTPayload } from 'src/common/types/token.type';
import { LoginResponseDTO } from 'src/modules/apis/auth/dto/login/LoginResponse.dto';
import { OAuthLoginBodyDTO } from 'src/modules/apis/auth/dto/oauth-login/OAuthLoginBody.dto';
import { LoginException } from 'src/modules/apis/auth/exceptions/LoginException';
import { BcryptService } from 'src/modules/libs/bcrypt/bcrypt.service';
import { GoogleOAuthService } from 'src/modules/libs/google-oauth/google-oauth.service';
import { RedisService } from 'src/modules/libs/redis/redis.service';
import { TokenService } from 'src/modules/libs/token/token.service';

@Injectable()
export class OAuthService {
  constructor(
    private redisService: RedisService,
    private tokenService: TokenService,
    @Inject(EProviderKey.PRISMA_PROVIDER)
    private prismaService: TExtendedPrismaClient,
    private googleOAuthService: GoogleOAuthService,
    private bcryptService: BcryptService
  ) {}

  googleLogin = async (body: OAuthLoginBodyDTO): Promise<LoginResponseDTO> => {
    const { oauthToken, otpCode, password } = body;
    const {
      email,
      picture: avatar,
      name: fullName
    } = await this.googleOAuthService.verifyIdToken(oauthToken);

    if (!email || !avatar || !fullName) {
      throw new LoginException({
        message: 'Not enough information from Google',
        errorType: ELoginExceptionErrorType.INVALID_CREDENTIALS
      });
    }

    const currentUser = await this.prismaService.user.findFirst({
      where: { email }
    });

    let user = currentUser;

    if (!user) {
      if (!password) {
        throw new LoginException({
          message: 'Password is required',
          errorType: ELoginExceptionErrorType.REQUIRED_INITIALIZE_PASSWORD
        });
      }
      const hashedPassword = await this.bcryptService.hash(password);
      user = await this.prismaService.user.create({
        data: { email, fullName, avatar, password: hashedPassword }
      });
    }

    if (user.isEnableTwoFactorAuth) {
      if (!otpCode) {
        throw new LoginException({
          message: 'Two factor authenticator code is required',
          errorType: ELoginExceptionErrorType.REQUIRED_2FA_OTP
        });
      }
      const twofaSecretKey = await this.redisService.getTwoFASecretKey(
        user?.id || ''
      );
      if (!twofaSecretKey) {
        throw new Error(
          `Can not find 2FA secret key of user with id: ${user?.id} in database`
        );
      }
      const isValidOtp = authenticator.verify({
        secret: twofaSecretKey,
        token: otpCode || ''
      });

      if (!isValidOtp) {
        throw new LoginException({
          message: 'Two factor authenticator code is invalid',
          errorType: ELoginExceptionErrorType.INVALID_2FA_OTP
        });
      }
    }

    const jwtPayload: TJWTPayload = {
      sub: user!.id,
      email: user!.email
    };
    const { token: accessToken, expiresIn } =
      await this.tokenService.signAccessToken(jwtPayload);
    const refreshToken = await this.tokenService.signRefreshToken(jwtPayload);

    await this.redisService.setUserRefreshToken(user!.id, refreshToken);

    return {
      user: user!,
      accessToken,
      refreshToken,
      expiresIn
    };
  };
}
