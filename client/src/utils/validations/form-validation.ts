import { z } from 'zod';

export const LoginFormValidationSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .max(20, 'Password must be at most 20 characters long')
});

export const SignupFormValidationSchema = z
  .object({
    fullName: z.string().min(1, 'Name is required'),
    email: z.email({ error: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters long')
      .max(20, 'Password must be at most 20 characters long'),
    confirmPassword: z.string().min(1, 'Confirm password is required')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password do not match',
    path: ['confirmPassword']
  });

export const ResetPasswordFormValidationSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters long')
      .max(20, 'Password must be at most 20 characters long'),
    confirmNewPassword: z.string().min(1, 'Confirm password is required')
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Password do not match',
    path: ['confirmNewPassword']
  });

export const ChangePasswordFormValidationSchema =
  ResetPasswordFormValidationSchema.and(
    z.object({
      currentPassword: z.string().min(1, 'Please enter your current password')
    })
  );

export const ForgotPasswordFormValidationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email({ message: 'Invalid email address' })
});

export const EditProfileFormValidationSchema = z.object({
  avatar: z.instanceof(File).optional(),
  fullName: z.string().min(1, 'Please enter your full name').optional()
});
