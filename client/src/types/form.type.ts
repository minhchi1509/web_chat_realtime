import { z } from 'zod';

import {
  ChangePasswordFormValidationSchema,
  EditProfileFormValidationSchema,
  ForgotPasswordFormValidationSchema,
  LoginFormValidationSchema,
  ResetPasswordFormValidationSchema,
  SignupFormValidationSchema
} from 'src/utils/validations/form-validation';

export type TLoginForm = z.infer<typeof LoginFormValidationSchema>;
export type TSignupForm = z.infer<typeof SignupFormValidationSchema>;
export type TResetPasswordForm = z.infer<
  typeof ResetPasswordFormValidationSchema
>;
export type TForgotPasswordForm = z.infer<
  typeof ForgotPasswordFormValidationSchema
>;
export type TEditProfileForm = z.infer<typeof EditProfileFormValidationSchema>;
export type TChangePasswordForm = z.infer<
  typeof ChangePasswordFormValidationSchema
>;
