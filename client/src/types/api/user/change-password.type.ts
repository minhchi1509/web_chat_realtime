export type TChangePasswordBody = {
  oldPassword: string;
  newPassword: string;
};

export type TChangePasswordResponse = {
  message: string;
};
