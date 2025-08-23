'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next-nprogress-bar';
import { useForm } from 'react-hook-form';

import { GoogleIcon } from 'src/assets/icons';
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
import { env } from 'src/configs/env.config';
import { ELoginErrorType } from 'src/constants/enum';
import { authService } from 'src/services';
import { TErrorResponse } from 'src/types/error-response.type';
import { TLoginForm } from 'src/types/form.type';
import { showErrorToast } from 'src/utils/toast.util';
import { LoginFormValidationSchema } from 'src/utils/validations/form-validation';

const LoginPage = () => {
  const { push } = useRouter();
  const form = useForm<TLoginForm>({
    resolver: zodResolver(LoginFormValidationSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const { isPending: isLogin, mutate: login } = useMutation({
    mutationFn: async (formValues: TLoginForm) => {
      const response = await authService.login(formValues);
      return response;
    },
    onSuccess: () => {
      push('/');
    },
    onError: (error: TErrorResponse) => {
      const errorType = error.data.errorType;
      if (errorType === ELoginErrorType.REQUIRED_2FA_OTP) {
        push('/two-factor-auth');
      } else {
        showErrorToast(error.message);
      }
    }
  });

  const handleLoginWithEmailPassword = async (data: TLoginForm) => {
    login(data);
  };

  const handleLoginWithGoogle = async () => {
    push(`${env.NEXT_PUBLIC_API_URL}/api/v1/oauth/google`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleLoginWithEmailPassword)}>
        <div className="flex h-screen items-center justify-center">
          <Card className="w-full max-w-md bg-zinc-50 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your email and password to access your account.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field: { ref, ...fields } }) => (
                  <FormItemInput
                    id="email"
                    placeholder="johndoe@example.com"
                    label="Email"
                    {...fields}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field: { ref, ...fields } }) => (
                  <FormItemInput
                    id="password"
                    type="password"
                    label="Password"
                    rightLabel={
                      <Link
                        href="/forgot-password"
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot?
                      </Link>
                    }
                    {...fields}
                  />
                )}
              />
            </CardContent>
            <CardFooter className="block">
              <Button type="submit" className="w-full" isLoading={isLogin}>
                Sign in
              </Button>
              <div className="mt-3">
                <p className="text-center text-sm text-muted-foreground">
                  Or you can sign in with
                </p>
                <div className="mt-2 flex justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLoginWithGoogle}
                  >
                    <GoogleIcon className="mr-2 size-4" />
                    Google
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
};

export default LoginPage;
