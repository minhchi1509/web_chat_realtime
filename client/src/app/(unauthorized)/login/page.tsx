'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next-nprogress-bar';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { login, loginWithGoogle } from 'src/actions/auth.actions';
import { GoogleIcon } from 'src/assets/icons';
import VerifyOTPModal from 'src/components/ui/features/login/VerifyOTPModal';
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
import { ELoginErrorType, ELoginType } from 'src/constants/enum';
import { TLoginPayload } from 'src/types/api/auth/login.type';
import { TErrorResponse } from 'src/types/error-response.type';
import { TLoginForm } from 'src/types/form.type';
import { executeServerAction } from 'src/utils/common.util';
import { showErrorToast } from 'src/utils/toast.util';
import { LoginFormValidationSchema } from 'src/utils/validations/form-validation';

const LoginPage = () => {
  const [openVerifyOTPModal, setOpenVerifyOTPModal] = useState<boolean>(false);
  const [loginPayload, setLoginPayload] = useState<TLoginPayload>();
  const { data: sessionData } = useSession();
  const { push } = useRouter();
  const form = useForm<TLoginForm>({
    resolver: zodResolver(LoginFormValidationSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const { isPending: isVerifyingAccount, mutate: verifyAccount } = useMutation({
    mutationFn: async (loginPayload: TLoginPayload) => {
      await signOut({ redirect: false });
      if (loginPayload.loginType === ELoginType.EMAIL_PASSWORD) {
        const { user, ...token } = await executeServerAction(() =>
          login({ body: { ...loginPayload } })
        );
        await signIn('credentials', { ...user, ...token, redirect: false });
      } else if (loginPayload.loginType === ELoginType.GOOGLE) {
        const { user, ...token } = await executeServerAction(() =>
          loginWithGoogle({ body: { ...loginPayload } })
        );
        await signIn('credentials', { ...user, ...token, redirect: false });
      }
    },
    onSuccess: () => {
      push('/');
    },
    onError: (error: TErrorResponse, loginPayload) => {
      const errorType = error.data.errorType;
      if (errorType === ELoginErrorType.REQUIRED_2FA_OTP) {
        setOpenVerifyOTPModal(true);
        setLoginPayload(loginPayload);
      } else if (
        errorType === ELoginErrorType.REQUIRED_INITIALIZE_PASSWORD &&
        loginPayload.loginType === ELoginType.GOOGLE
      ) {
        const resetPasswordQueryString = new URLSearchParams();
        resetPasswordQueryString.append('config', 'default');
        resetPasswordQueryString.append(
          'reset_password_token',
          loginPayload.oauthToken
        );
        push(`/reset-password?${resetPasswordQueryString.toString()}`);
      } else {
        showErrorToast(error.message);
      }
    }
  });

  const handleLoginWithEmailPassword = async (data: TLoginForm) => {
    verifyAccount({ loginType: ELoginType.EMAIL_PASSWORD, ...data });
  };

  useEffect(() => {
    (async () => {
      const userOAuthProfile = sessionData?.user?.oAuthProfile;
      if (userOAuthProfile) {
        const oauthType = userOAuthProfile.provider;
        switch (oauthType) {
          case 'google':
            verifyAccount({
              loginType: ELoginType.GOOGLE,
              oauthToken: userOAuthProfile.id_token as string
            });
            break;
          case 'github':
            verifyAccount({
              loginType: ELoginType.GITHUB,
              oauthToken: userOAuthProfile.id_token as string
            });
            break;
          default:
            break;
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLoginWithEmailPassword)}>
          <Card className="w-full max-w-md bg-zinc-50 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
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
              <div className="m-0 text-right"></div>
            </CardContent>
            <CardFooter className="block">
              <Button
                type="submit"
                className="w-full"
                isLoading={isVerifyingAccount}
              >
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
                    onClick={async () => signIn('google', { redirect: false })}
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
        </form>
      </Form>
      <VerifyOTPModal
        open={openVerifyOTPModal}
        onOpenChange={setOpenVerifyOTPModal}
        loginPayload={loginPayload!}
      />
    </div>
  );
};

export default LoginPage;
