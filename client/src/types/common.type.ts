import { TErrorResponse } from 'src/types/error-response.type';

export interface IBasePageProps<P, S = {}> {
  params: Promise<P>;
  searchParams?: Record<string, string | undefined>;
}

export type TServerActionFnReturn<D> = Promise<
  { error: TErrorResponse; data?: never } | { error?: never; data: D }
>;

export type TSafeServerActionFn<A extends any[], D> = (
  ...args: A
) => TServerActionFnReturn<D>;

export type TPaginationQuery = {
  page: number;
  pageSize: number;
};

export type TGetListResponse<T> = {
  currentPage: number;
  totalPage: number;
  pageSize: number;
  hasNextPage: boolean;
  data: T[];
};

export type TUploadFile = {
  originalFileObject: File;
  previewUrl: string;
  id: string;
};
