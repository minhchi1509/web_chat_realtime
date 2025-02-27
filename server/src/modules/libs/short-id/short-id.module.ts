import { DynamicModule, Module } from '@nestjs/common';

import { EProviderKey } from 'src/common/constants/provider-key.enum';
import {
  IShortIdModuleAsyncOptions,
  IShortIdModuleOptions
} from 'src/common/types/short-id-module.type';
import { ShortUniqueIdService } from 'src/modules/libs/short-id/short-id.service';

@Module({})
export class ShortUniqueIdModule {
  static register(options: IShortIdModuleOptions): DynamicModule {
    return {
      module: ShortUniqueIdModule,
      providers: [
        { provide: EProviderKey.SHORT_ID_OPTIONS, useValue: options },
        ShortUniqueIdService
      ],
      exports: [ShortUniqueIdService],
      global: options.isGlobal ?? false
    };
  }

  static registerAsync(options: IShortIdModuleAsyncOptions): DynamicModule {
    const defaultFactory = (...args: any[]) => null;

    return {
      module: ShortUniqueIdModule,
      imports: options.imports || [],
      providers: [
        {
          provide: EProviderKey.SHORT_ID_OPTIONS,
          useFactory: options.useFactory ?? defaultFactory,
          inject: options.inject ?? []
        },
        ShortUniqueIdService
      ],
      exports: [ShortUniqueIdService],
      global: options.isGlobal ?? false
    };
  }
}
