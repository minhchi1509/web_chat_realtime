import { ShortUniqueIdOptions } from 'short-unique-id';

export interface IShortIdModuleOptions extends Partial<ShortUniqueIdOptions> {
  isGlobal?: boolean;
}

export interface IShortIdModuleAsyncOptions {
  isGlobal?: boolean;
  imports?: any[];
  useFactory?: (
    ...args: any[]
  ) => Promise<ShortUniqueIdOptions> | ShortUniqueIdOptions;
  inject?: any[];
}
