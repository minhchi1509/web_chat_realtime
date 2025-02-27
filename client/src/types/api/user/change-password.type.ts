type TChangePasswordBody = {
  oldPassword: string;
  newPassword: string;
};

export type TChangePasswordRequest = {
  body: TChangePasswordBody;
};

export type TChangePasswordResponse = {
  message: string;
};
