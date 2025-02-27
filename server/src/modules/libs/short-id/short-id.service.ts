import { Inject, Injectable } from '@nestjs/common';
import ShortUniqueId, { ShortUniqueIdOptions } from 'short-unique-id';

import { EProviderKey } from 'src/common/constants/provider-key.enum';

@Injectable()
export class ShortUniqueIdService extends ShortUniqueId {
  constructor(
    @Inject(EProviderKey.SHORT_ID_OPTIONS) options: ShortUniqueIdOptions
  ) {
    super(options);
  }
}
