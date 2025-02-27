import { Module } from '@nestjs/common';

import { PrismaProvider } from 'src/modules/libs/prisma/prisma.provider';
import { PrismaConnectService } from 'src/modules/libs/prisma/prisma-connect.service';

@Module({
  providers: [PrismaConnectService, PrismaProvider],
  exports: [PrismaProvider]
})
export class PrismaModule {}
