'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next-nprogress-bar';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

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
import { authService } from 'src/services';
import { TResetPasswordForm } from 'src/types/form.type';
import { showErrorToast, showSuccessToast } from 'src/utils/toast.util';
import { ResetPasswordFormValidationSchema } from 'src/utils/validations/form-validation';

const ResetPasswordPage = () => {
  const { push } = useRouter();
  const searchParams = useSearchParams();

  const type = searchParams.get('type');
  const token = searchParams.get('token');
  const cardTitle =
    type === 'init_oauth_password'
      ? 'Initialize OAuth Password'
      : 'Reset Password';

  const form = useForm<TResetPasswordForm>({
    resolver: zodResolver(ResetPasswordFormValidationSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: ''
    }
  });

  const {
    isPending: isInitializingOAuthPassword,
    mutate: initializeOAuthPassword
  } = useMutation({
    mutationFn: async (password: string) => {
      const response = await authService.initOAuthPassword(
        token || '',
        password
      );
      return response;
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
        await authService.resetPassword(token || '', {
          newPassword: password
        });
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
    if (type === 'init_oauth_password') {
      initializeOAuthPassword(formValues.newPassword);
    } else {
      triggerResetPassword(formValues.newPassword);
    }
  };

  useEffect(() => {
    if ((!type && !type) || !token) {
      push('/login');
      return;
    }
  }, [type, token, push]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitResetPasswordForm)}>
        <div className="flex min-h-screen items-center justify-center">
          <Card className="w-full max-w-md bg-zinc-50 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>{cardTitle}</CardTitle>
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
                isLoading={isResettingPassword || isInitializingOAuthPassword}
              >
                {type === 'init_oauth_password' ? 'Initialize' : 'Reset'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
};

export default ResetPasswordPage;
