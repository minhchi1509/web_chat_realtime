import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FirebaseProvider } from 'src/modules/libs/firebase/firebase.provider';

@Module({
  imports: [ConfigModule],
  providers: [FirebaseProvider]
})
export class FirebaseModule {}
