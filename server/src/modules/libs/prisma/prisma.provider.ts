import { Provider } from '@nestjs/common';

import { createExtendedPrismaClient } from 'src/common/configs/prisma.config';
import { EProviderKey } from 'src/common/constants/provider-key.enum';

export const PrismaProvider: Provider = {
  provide: EProviderKey.PRISMA_PROVIDER,
  useFactory: () => {
    return createExtendedPrismaClient();
  }
};
