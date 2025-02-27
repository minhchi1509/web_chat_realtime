export type TErrorData = {
  statusCode: number;
  message: string;
  path: string;
  errorType: string;
};

export type TErrorResponse = {
  message: string;
  data: TErrorData;
};
