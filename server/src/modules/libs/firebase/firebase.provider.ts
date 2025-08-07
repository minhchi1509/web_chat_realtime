import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import admin from 'firebase-admin';

import { EProviderKey } from 'src/common/constants/provider-key.enum';
import { IEnvironmentVariables } from 'src/common/types/env.type';

export const FirebaseProvider: Provider = {
  provide: EProviderKey.FIREBASE_PROVIDER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService<IEnvironmentVariables>) => {
    const firebaseConfig: admin.ServiceAccount = {
      projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
      privateKey: configService
        .get<string>('FIREBASE_PRIVATE_KEY')
        ?.replace(/\\n/g, '\n'),
      clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL')
    };
    return admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
      storageBucket: `${firebaseConfig.projectId}.appspot.com`
    });
  }
};
