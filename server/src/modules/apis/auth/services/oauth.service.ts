import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { TExtendedPrismaClient } from 'src/common/configs/prisma.config';
import {
  ECookieName,
  EOAuthProvider,
  ETokenExpiration
} from 'src/common/constants/common.enum';
import { EProviderKey } from 'src/common/constants/provider-key.enum';
import { IEnvironmentVariables } from 'src/common/types/env.type';
import { TJWTPayload, TOAuthProfile } from 'src/common/types/token.type';
import { InitOAuthPasswordBodyDTO } from 'src/modules/apis/auth/dto/init-oauth-password/InitOAuthPasswordBody.dto';
import { InitOAuthPasswordResponseDTO } from 'src/modules/apis/auth/dto/init-oauth-password/InitOAuthPasswordResponse.dto';
import { BcryptService } from 'src/modules/libs/bcrypt/bcrypt.service';
import { CookiesService } from 'src/modules/libs/cookies/cookies.service';
import { RedisService } from 'src/modules/libs/redis/redis.service';
import { TokenService } from 'src/modules/libs/token/token.service';

@Injectable()
export class OAuthService {
  constructor(
    private redisService: RedisService,
    private tokenService: TokenService,
    @Inject(EProviderKey.PRISMA_PROVIDER)
    private prismaService: TExtendedPrismaClient,
    private cookiesService: CookiesService,
    private bcryptService: BcryptService,
    private configService: ConfigService<IEnvironmentVariables>
  ) {}

  googleLoginRedirect = async (
    oAuthProfile: TOAuthProfile,
    res: Response
  ): Promise<void> => {
    const { email, fullName, avatarUrl } = oAuthProfile;
    const clientBaseUrl = this.configService.get<string>('CLIENT_URL') || '';

    const currentUser = await this.prismaService.user.findFirst({
      where: { email }
    });

    const user = currentUser;

    if (!user) {
      const oauthPayloadToken = await this.tokenService.signOAuthPayloadToken({
        email,
        fullName,
        avatarUrl,
        provider: EOAuthProvider.GOOGLE
      });
      await this.redisService.setInitOAuthPasswordToken(
        EOAuthProvider.GOOGLE,
        email,
        oauthPayloadToken
      );

      const clientRedirectUrl = new URL(`${clientBaseUrl}/reset-password`);
      const queryParams = new URLSearchParams([
        ['type', 'init_oauth_password'],
        ['token', oauthPayloadToken]
      ]);

      clientRedirectUrl.search = queryParams.toString();
      return res.redirect(clientRedirectUrl.toString());
    }

    if (user.isEnableTwoFactorAuth) {
      const twoFAPayloadToken = await this.tokenService.signTwoFactorAuthToken({
        userId: user.id,
        email: user.email
      });
      const clientRedirectUrl = new URL(`${clientBaseUrl}/two-factor-auth`);

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

      return res.redirect(clientRedirectUrl.toString());
    }

    const jwtPayload: TJWTPayload = {
      sub: user.id,
      email: user.email
    };

    await this.tokenService.createAccessTokenAndRefreshToken(jwtPayload, res);

    return res.redirect(
      `${this.configService.get<string>('CLIENT_URL') || ''}/`
    );
  };

  initPassword = async (
    token: string,
    body: InitOAuthPasswordBodyDTO,
    res: Response
  ): Promise<InitOAuthPasswordResponseDTO> => {
    const decodedOAuthInitPasswordToken =
      await this.tokenService.verifyInitOAuthPasswordToken(token);
    if (!decodedOAuthInitPasswordToken) {
      throw new BadRequestException('Invalid OAuth init password token');
    }
    const oAuthInitPasswordToken =
      await this.redisService.getInitOAuthPasswordToken(
        EOAuthProvider.GOOGLE,
        decodedOAuthInitPasswordToken.email
      );
    if (!oAuthInitPasswordToken) {
      throw new BadRequestException('Invalid OAuth init password token');
    }

    const user = await this.prismaService.user.findUnique({
      where: { email: decodedOAuthInitPasswordToken.email }
    });

    if (user) {
      throw new BadRequestException(
        'This email is already associated with an account. Please use a different email.'
      );
    }

    const { password } = body;
    const { email, fullName, avatarUrl } = decodedOAuthInitPasswordToken;
    const hashedPassword = await this.bcryptService.hash(password);
    const createdUser = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        avatar: avatarUrl
      }
    });

    const jwtPayload: TJWTPayload = {
      sub: createdUser.id,
      email: createdUser.email
    };

    await this.tokenService.createAccessTokenAndRefreshToken(jwtPayload, res);
    await this.redisService.deleteInitOAuthPasswordToken(
      EOAuthProvider.GOOGLE,
      decodedOAuthInitPasswordToken.email
    );

    return {
      message: 'OAuth password initialized successfully.',
      user: createdUser
    };
  };
}
