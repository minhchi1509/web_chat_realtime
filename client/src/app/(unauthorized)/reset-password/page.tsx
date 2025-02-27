'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next-nprogress-bar';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { loginWithGoogle, resetPassword } from 'src/actions/auth.actions';
import { Button } from 'src/components/ui/shadcn-ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from 'src/components/ui/shadcn-ui/card';
import { Form, FormField } from 'src/components/ui/shadcn-ui/form';
import FormItemInput from 'src/components/ui/shared/form/FormItemInput';
import { TResetPasswordForm } from 'src/types/form.type';
import { executeServerAction } from 'src/utils/common.util';
import { showErrorToast, showSuccessToast } from 'src/utils/toast.util';
import { ResetPasswordFormValidationSchema } from 'src/utils/validations/form-validation';

const ResetPasswordPage = () => {
  const { push } = useRouter();
  const searchParams = useSearchParams();

  const config = searchParams.get('config');
  const resetPasswordToken = searchParams.get('reset_password_token');
  const passwordType = config === 'default' ? 'Initialize' : 'Reset';

  const form = useForm<TResetPasswordForm>({
    resolver: zodResolver(ResetPasswordFormValidationSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: ''
    }
  });

  const { isPending: isInitializingPassword, mutate: initializePassword } =
    useMutation({
      mutationFn: async (password: string) => {
        const { user, ...token } = await executeServerAction(() =>
          loginWithGoogle({
            body: {
              oauthToken: resetPasswordToken!,
              password
            }
          })
        );
        await signIn('credentials', { ...user, ...token, redirect: false });
      },
      onSuccess: () => {
        push('/');
      },
      onError: (error) => {
        showErrorToast(error.message);
      }
    });

  const { isPending: isResettingPassword, mutate: triggerResetPassword } =
    useMutation({
      mutationFn: async (password: string) => {
        await executeServerAction(() =>
          resetPassword({
            body: { newPassword: password, token: resetPasswordToken || '' }
          })
        );
      },
      onSuccess: () => {
        showSuccessToast(
          'Reset password successfully. Please login to continue'
        );
        push('/login');
      },
      onError: (error) => {
        showErrorToast(error.message);
      }
    });

  const onSubmitResetPasswordForm = async (formValues: TResetPasswordForm) => {
    if (config === 'default') {
      initializePassword(formValues.newPassword);
    } else {
      triggerResetPassword(formValues.newPassword);
    }
  };

  useEffect(() => {
    if ((!config && !resetPasswordToken) || !resetPasswordToken) {
      push('/login');
      return;
    }
  }, [config, resetPasswordToken, push]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitResetPasswordForm)}>
        <div className="flex min-h-screen items-center justify-center">
          <Card className="w-full max-w-md bg-zinc-50 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>{passwordType} Password</CardTitle>
              <CardDescription>Enter your new password below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field: { ref, ...fields } }) => (
                  <FormItemInput
                    id="newPassword"
                    type="password"
                    label="New password"
                    {...fields}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field: { ref, ...fields } }) => (
                  <FormItemInput
                    id="confirmNewPassword"
                    type="password"
                    label="Confirm new password"
                    {...fields}
                  />
                )}
              />
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                isLoading={isResettingPassword || isInitializingPassword}
              >
                {passwordType} Password
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
};

export default ResetPasswordPage;
