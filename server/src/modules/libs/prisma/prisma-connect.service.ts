import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { TExtendedPrismaClient } from 'src/common/configs/prisma.config';
import { EProviderKey } from 'src/common/constants/provider-key.enum';

@Injectable()
export class PrismaConnectService implements OnModuleInit {
  private readonly logger = new Logger(PrismaConnectService.name);
  constructor(
    @Inject(EProviderKey.PRISMA_PROVIDER) private prisma: TExtendedPrismaClient
  ) {}

  async onModuleInit() {
    try {
      await this.prisma.$connect();
      this.logger.log('🚀 Connect to database successfully!');
    } catch (error) {
      await this.prisma.$disconnect();
      throw new Error(
        `❌ Connect to database failed: ${(error as Error).message}`
      );
    }
  }
}
