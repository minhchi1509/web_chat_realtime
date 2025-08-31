'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@bprogress/next';
import React, { useEffect, useState } from 'react';

import { Button } from 'src/components/ui/shadcn-ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from 'src/components/ui/shadcn-ui/card';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from 'src/components/ui/shadcn-ui/input-otp';
import { TWO_FACTOR_CODE_LENGTH } from 'src/constants/variables';
import { authService } from 'src/services';

const TwoFactorAuthPage = () => {
  const { push } = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');

  const handleChangeOtpCode = async (code: string) => {
    setOtpCode(code);
    setErrorMessage('');
  };

  const { isPending: isVerifying, mutate: verifyTwoFactorAuthCode } =
    useMutation({
      mutationFn: async () => {
        await authService.verifyTwoFactorAuthentication({ otpCode });
      },
      onSuccess: () => {
        push('/');
      },
      onError: () => {
        setErrorMessage('Invalid OTP code');
      }
    });

  useEffect(() => {
    if (otpCode.length === TWO_FACTOR_CODE_LENGTH) {
      verifyTwoFactorAuthCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpCode]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md bg-zinc-50 dark:bg-zinc-900">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app to verify your
            identity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <InputOTP
              value={otpCode}
              onChange={handleChangeOtpCode}
              maxLength={TWO_FACTOR_CODE_LENGTH}
            >
              <InputOTPGroup className="gap-2">
                {Array.from({ length: TWO_FACTOR_CODE_LENGTH }).map(
                  (_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="rounded-lg border"
                    />
                  )
                )}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {errorMessage && (
            <p className="text-center text-red-500">{errorMessage}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={otpCode.length < 6}
            isLoading={isVerifying}
            onClick={() => verifyTwoFactorAuthCode()}
          >
            Verify
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TwoFactorAuthPage;
