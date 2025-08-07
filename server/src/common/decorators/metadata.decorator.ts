import { SetMetadata, Type } from '@nestjs/common';

import { EMetadataKey } from 'src/common/constants/common.enum';
import { IPolicyHandler } from 'src/common/types/policy.type';

export const PublicRoute = () =>
  SetMetadata(EMetadataKey.IS_PUBLIC_ROUTE, true);

export const ProtectedRoute = () =>
  SetMetadata(EMetadataKey.IS_PUBLIC_ROUTE, false);

export const CheckPolicies = (...handlers: Type<IPolicyHandler>[]) => {
  return SetMetadata(EMetadataKey.CHECK_POLICIES_KEY, handlers);
};
