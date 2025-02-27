type TMail<T> = {
  to: string;
  context: T;
};

type TResetPasswordMailContext = {
  name: string;
  reset_link: string;
};

export type TResetPasswordMailData = TMail<TResetPasswordMailContext>;
