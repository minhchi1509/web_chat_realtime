import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

import { TExtendedPrismaClient } from 'src/common/configs/prisma.config';
import { DEFAULT_USER_AVATAR_URL } from 'src/common/constants/common.constant';
import { EProviderKey } from 'src/common/constants/provider-key.enum';
import { MessageResponseDTO } from 'src/common/dto/MessageResponse.dto';
import { UserResponseDTO } from 'src/common/dto/UserResponse.dto';
import { DisabledTwoFABodyDTO } from 'src/modules/apis/user/dto/2fa/DisabledTwoFABody.dto';
import { GenerateTwoFAResponseDTO } from 'src/modules/apis/user/dto/2fa/GenerateTwoFAResponse.dto';
import { ModifyTwoFAResponseDTO } from 'src/modules/apis/user/dto/2fa/ModifyTwoFAResponse.dto';
import { ChangePasswordBodyDTO } from 'src/modules/apis/user/dto/change-password/ChangePasswordBody.dto';
import { UpdateProfileBodyDTO } from 'src/modules/apis/user/dto/update-profile/UpdateProfileBody.dto';
import { UpdateProfileResponseDTO } from 'src/modules/apis/user/dto/update-profile/UpdateProfileResponse.dto';
import { BcryptService } from 'src/modules/libs/bcrypt/bcrypt.service';
import { CloudinaryService } from 'src/modules/libs/cloudinary/cloudinary.service';
import { RedisService } from 'src/modules/libs/redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    private cloudinaryService: CloudinaryService,
    @Inject(EProviderKey.PRISMA_PROVIDER)
    private prismaService: TExtendedPrismaClient,
    private bcryptService: BcryptService,
    private redisService: RedisService
  ) {}

  editProfile = async (
    userId: string,
    body: UpdateProfileBodyDTO
  ): Promise<UpdateProfileResponseDTO> => {
    const { avatar, fullName } = body;
    const user = await this.prismaService.user
      .findUniqueOrThrow({ where: { id: userId } })
      .catch(() => {
        throw new NotFoundException('User not found');
      });
    let uploadAvatarResponse;
    if (avatar) {
      const currentUserAvatarURL = user.avatar;
      if (currentUserAvatarURL !== DEFAULT_USER_AVATAR_URL) {
        await this.cloudinaryService.deleteFileByUrl(currentUserAvatarURL);
      }
      uploadAvatarResponse = await this.cloudinaryService.uploadFile(avatar, {
        folder: 'avatar'
      });
    }
    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(uploadAvatarResponse && { avatar: uploadAvatarResponse.secure_url })
      }
    });
    return {
      message: 'Update profile successfully',
      updatedUser
    };
  };

  changePassword = async (
    userId: string,
    body: ChangePasswordBodyDTO
  ): Promise<MessageResponseDTO> => {
    const { newPassword, oldPassword } = body;

    const user = await this.prismaService.user
      .findFirstOrThrow({ where: { id: userId } })
      .catch(() => {
        throw new NotFoundException('User not found');
      });
    const isPasswordMatched = await this.bcryptService.isMatch(
      oldPassword,
      user.password
    );
    if (!isPasswordMatched) {
      throw new BadRequestException('Old password is incorrect');
    }
    const hashedPassword = await this.bcryptService.hash(newPassword);
    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword
      }
    });
    return {
      message: 'Change password successfully'
    };
  };

  generateTwoFA = async (userId: string): Promise<GenerateTwoFAResponseDTO> => {
    const user = await this.prismaService.user
      .findUniqueOrThrow({ where: { id: userId } })
      .catch(() => {
        throw new NotFoundException('User not found');
      });

    if (user.isEnableTwoFactorAuth) {
      throw new BadRequestException(
        'Two-factor authentication has already been enabled. Turn it off before generating a new secret key'
      );
    }

    const serviceName = 'Task Management App';
    const secretKey = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, serviceName, secretKey);
    const QRCodeImageURL = await qrcode.toDataURL(otpauthUrl);
    await this.redisService.setTwoFASecretKey(userId, secretKey);

    return {
      user,
      qrCodeUrl: QRCodeImageURL,
      secretKey
    };
  };

  enableTwoFA = async (
    userId: string,
    otpCode: string
  ): Promise<ModifyTwoFAResponseDTO> => {
    const user = await this.prismaService.user
      .findFirstOrThrow({ where: { id: userId } })
      .catch(() => {
        throw new NotFoundException('User not found');
      });

    if (user.isEnableTwoFactorAuth) {
      throw new BadRequestException(
        'Two-factor authentication has already been enabled'
      );
    }

    const userTwoFASecretKey =
      await this.redisService.getTwoFASecretKey(userId);
    if (!userTwoFASecretKey) {
      throw new Error(
        `Can not find 2FA secret key of user with id: ${user?.id} in database`
      );
    }
    const isOTPValid = authenticator.verify({
      secret: userTwoFASecretKey,
      token: otpCode
    });

    if (!isOTPValid) {
      throw new BadRequestException('OTP code is invalid');
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        isEnableTwoFactorAuth: true
      }
    });

    return {
      message: 'Enable two-factor authentication successfully',
      user: updatedUser
    };
  };

  disableTwoFA = async (
    body: DisabledTwoFABodyDTO,
    userId: string
  ): Promise<ModifyTwoFAResponseDTO> => {
    const { password } = body;
    const user = await this.prismaService.user
      .findFirstOrThrow({ where: { id: userId } })
      .catch(() => {
        throw new NotFoundException('User not found');
      });

    if (!user.isEnableTwoFactorAuth) {
      throw new BadRequestException(
        'Two-factor authentication has not been enabled'
      );
    }

    const isPasswordMatched = await this.bcryptService.isMatch(
      password,
      user.password
    );

    if (!isPasswordMatched) {
      throw new BadRequestException('Password is incorrect');
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        isEnableTwoFactorAuth: false
      }
    });
    await this.redisService.deleteTwoFASecretKey(userId);

    return {
      user: updatedUser,
      message: 'Disable two-factor authentication successfully'
    };
  };

  logout = async (userId: string): Promise<MessageResponseDTO> => {
    await this.redisService.deleteUserRefreshToken(userId);
    return {
      message: 'Logout successfully'
    };
  };

  getProfile = async (userId: string): Promise<UserResponseDTO> => {
    const user = await this.prismaService.user
      .findFirstOrThrow({ where: { id: userId } })
      .catch(() => {
        throw new NotFoundException('User not found');
      });
    return user;
  };
}
