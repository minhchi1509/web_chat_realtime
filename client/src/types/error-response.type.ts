export type TErrorData = {
  statusCode: number;
  message: string;
  path: string;
  errorType: string;
  errors: any;
};

export type TErrorResponse = {
  message: string;
  data: TErrorData;
};

export type TWsErrorResponse = {
  clientId: string;
  pattern: string;
  payload: any;
  message: string;
  errorCode?: number;
};
