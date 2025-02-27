'use client';
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next-nprogress-bar';
import { FC, useEffect, useState } from 'react';

import { login, loginWithGoogle } from 'src/actions/auth.actions';
import { Button } from 'src/components/ui/shadcn-ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from 'src/components/ui/shadcn-ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from 'src/components/ui/shadcn-ui/input-otp';
import { ELoginType } from 'src/constants/enum';
import { TWO_FACTOR_CODE_LENGTH } from 'src/constants/variables';
import { TLoginPayload } from 'src/types/api/auth/login.type';
import { executeServerAction } from 'src/utils/common.util';

interface IVerifyOTPModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loginPayload: TLoginPayload;
}

const VerifyOTPModal: FC<IVerifyOTPModalProps> = ({
  open,
  onOpenChange,
  loginPayload
}) => {
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
        if (loginPayload.loginType === ELoginType.EMAIL_PASSWORD) {
          const { user, ...token } = await executeServerAction(() =>
            login({ body: { ...loginPayload, otpCode } })
          );
          await signIn('credentials', { ...user, ...token });
        } else if (loginPayload.loginType === ELoginType.GOOGLE) {
          const { user, ...token } = await executeServerAction(() =>
            loginWithGoogle({ body: { ...loginPayload, otpCode } })
          );
          await signIn('credentials', { ...user, ...token });
        }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        forceMount
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code from your authenticator app to verify your
            identity.
          </DialogDescription>
        </DialogHeader>
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
        <DialogFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={otpCode.length < 6}
            isLoading={isVerifying}
            onClick={() => verifyTwoFactorAuthCode()}
          >
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyOTPModal;
