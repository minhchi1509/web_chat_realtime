'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next-nprogress-bar';
import { useForm } from 'react-hook-form';

import { signup } from 'src/actions/auth.actions';
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
import { TErrorResponse } from 'src/types/error-response.type';
import { TSignupForm } from 'src/types/form.type';
import { executeServerAction } from 'src/utils/common.util';
import { showErrorToast, showSuccessToast } from 'src/utils/toast.util';
import { SignupFormValidationSchema } from 'src/utils/validations/form-validation';

const SignupPage = () => {
  const { push } = useRouter();
  const form = useForm<TSignupForm>({
    resolver: zodResolver(SignupFormValidationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const signupMutation = useMutation({
    mutationFn: async (data: TSignupForm) => {
      const response = await executeServerAction(() => signup({ body: data }));
      return response;
    },
    onSuccess: () => {
      showSuccessToast('Signup successfully. Please login to continue');
      push('/login');
    },
    onError: (error: TErrorResponse) => {
      showErrorToast(error.message);
    }
  });

  const handleSubmitSignupForm = async (data: TSignupForm) => {
    signupMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitSignupForm)}>
        <div className="flex min-h-screen items-center justify-center">
          <Card className="w-full max-w-md bg-zinc-50 dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>
                Create your account to get started
              </CardDescription>
            </CardHeader>
            <div>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field: { ref, ...fields } }) => (
                    <FormItemInput
                      id="fullName"
                      placeholder="John Doe"
                      label="Full name"
                      {...fields}
                    />
                  )}
                />
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
                      {...fields}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field: { ref, ...fields } }) => (
                    <FormItemInput
                      id="confirmPassword"
                      type="password"
                      label="Confirm password"
                      {...fields}
                    />
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={signupMutation.isPending}
                >
                  Sign Up
                </Button>
                <div className="mt-2 text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Log in
                  </Link>
                </div>
              </CardFooter>
            </div>
          </Card>
        </div>
      </form>
    </Form>
  );
};

export default SignupPage;
