type TForgotPasswordBody = {
  email: string;
};

export type TForgotPasswordRequest = {
  body: TForgotPasswordBody;
};

export type TForgotPasswordResponse = {
  message: string;
};
