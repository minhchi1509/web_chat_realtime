export type TSignupBody = {
  fullName: string;
  email: string;
  password: string;
};

export type TSignupResponse = {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
};
