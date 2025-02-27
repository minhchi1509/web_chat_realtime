import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 } from 'cloudinary';

import { EProviderKey } from 'src/common/constants/provider-key.enum';
import { IEnvironmentVariables } from 'src/common/types/env.type';

export const CloudinaryProvider: Provider = {
  provide: EProviderKey.CLOUDINARY_PROVIDER,
  useFactory: (configService: ConfigService<IEnvironmentVariables>) =>
    v2.config({
      cloud_name: configService.get<string>('CLOUDINARY_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET')
    }),
  inject: [ConfigService]
};
