type TSignupBody = {
  fullName: string;
  email: string;
  password: string;
};

export type TSignupRequest = {
  body: TSignupBody;
};

export type TSignupResponse = {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
};
