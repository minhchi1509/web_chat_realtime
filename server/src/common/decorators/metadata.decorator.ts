import { SetMetadata } from '@nestjs/common';

import { EMetadataKey } from 'src/common/constants/common.enum';

export const PublicRoute = () =>
  SetMetadata(EMetadataKey.IS_PUBLIC_ROUTE, true);

export const ProtectedRoute = () =>
  SetMetadata(EMetadataKey.IS_PUBLIC_ROUTE, false);
