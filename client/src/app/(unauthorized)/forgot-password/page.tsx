'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { sendResetPasswordEmail } from 'src/actions/auth.actions';
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
import { RESET_PASSWORD_LINK_EXPIRED_TIME } from 'src/constants/variables';
import useTimeCountDown from 'src/hooks/useTimeCountDown';
import { TErrorResponse } from 'src/types/error-response.type';
import { TForgotPasswordForm } from 'src/types/form.type';
import { executeServerAction } from 'src/utils/common.util';
import { showErrorToast } from 'src/utils/toast.util';
import { ForgotPasswordFormValidationSchema } from 'src/utils/validations/form-validation';

const ForgotPasswordPage = () => {
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [expiredTime, setExpiredTime] = useState<number>(0);
  const { remainingTime, formatTime } = useTimeCountDown(expiredTime);
  const form = useForm<TForgotPasswordForm>({
    resolver: zodResolver(ForgotPasswordFormValidationSchema),
    defaultValues: {
      email: ''
    }
  });

  const canResendEmail = remainingTime <= 0;
  const { isPending: isSendingResetPassword, mutate: sendResetPasswordMail } =
    useMutation({
      mutationFn: async (formData: TForgotPasswordForm) => {
        await executeServerAction(() =>
          sendResetPasswordEmail({ body: formData })
        );
      },
      onSuccess: () => {
        setIsSubmitted(true);
        setExpiredTime(0);
        setTimeout(() => {
          setExpiredTime(RESET_PASSWORD_LINK_EXPIRED_TIME);
        }, 0);
      },
      onError: (error: TErrorResponse) => {
        showErrorToast(error.message);
      }
    });

  const onSubmitSendResetPasswordEmailForm = async (
    formData: TForgotPasswordForm
  ) => {
    sendResetPasswordMail(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitSendResetPasswordEmailForm)}>
        <div className="flex min-h-screen items-center justify-center">
          <Card className="w-full max-w-md bg-zinc-50 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>Forgot Password</CardTitle>
              <CardDescription>
                Enter your email to receive a password reset link. They might
                end up in your spam folder, so please check there as well.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field: { ref, ...fields } }) => (
                  <FormItemInput
                    id="email"
                    type="email"
                    label="Email"
                    disabled={isSubmitted}
                    {...fields}
                  />
                )}
              />
              {isSubmitted && !canResendEmail && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-center space-x-2 text-green-500">
                    <CheckCircle size={16} />
                    <p className="text-sm">
                      An email has been sent to your email address
                    </p>
                  </div>
                  <p className="text-center text-sm">
                    You can resend email after {formatTime}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={!canResendEmail}
                isLoading={isSendingResetPassword}
              >
                {isSubmitted ? 'Resend Email' : 'Send Email'}
              </Button>
              <Link
                href="/login"
                className="text-sm text-primary hover:underline"
              >
                Back to Login
              </Link>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
};

export default ForgotPasswordPage;
