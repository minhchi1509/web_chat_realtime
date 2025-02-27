import { Module } from '@nestjs/common';

import { BcryptService } from 'src/modules/libs/bcrypt/bcrypt.service';

@Module({
  providers: [BcryptService],
  exports: [BcryptService]
})
export class BcryptModule {}
