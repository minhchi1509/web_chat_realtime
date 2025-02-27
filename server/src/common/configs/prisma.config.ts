import { Prisma, PrismaClient } from '@prisma/client';
import pagination from 'prisma-extension-pagination';

export const createExtendedPrismaClient = (
  options?: Prisma.PrismaClientOptions
) => {
  const extendedPrismaClient = new PrismaClient(options).$extends(pagination());
  return extendedPrismaClient;
};

export type TExtendedPrismaClient = ReturnType<
  typeof createExtendedPrismaClient
>;
