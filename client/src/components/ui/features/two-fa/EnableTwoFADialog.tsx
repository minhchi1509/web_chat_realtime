'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';

import { Button } from 'src/components/ui/shadcn-ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from 'src/components/ui/shadcn-ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from 'src/components/ui/shadcn-ui/input-otp';
import { EQueryKey } from 'src/constants/enum';
import { TWO_FACTOR_CODE_LENGTH } from 'src/constants/variables';
import { userService } from 'src/services';
import { showErrorToast, showSuccessToast } from 'src/utils/toast.util';

interface IEnableTwoFADialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const EnableTwoFADialog: FC<IEnableTwoFADialogProps> = ({ open, setOpen }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [qrCode, setQrCode] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const previousStep = () => setCurrentStep((prev) => prev - 1);

  const { isPending: isGenerating2FA, mutate: triggerGenerate2FA } =
    useMutation({
      mutationFn: async () => {
        const responseData = await userService.generate2FA();
        return responseData;
      },
      onSuccess: (data) => {
        setQrCode(data.qrCodeUrl);
        setSecretKey(data.secretKey);
      },
      onError: (error) => {
        showErrorToast(error.message);
        setOpen(false);
      }
    });

  useEffect(() => {
    triggerGenerate2FA();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Step1 = () => {
    if (isGenerating2FA) {
      return (
        <Loader2 className="absolute inset-0 m-auto size-8 animate-spin" />
      );
    }
    return (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4"
      >
        <DialogHeader>
          <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            To be able to authorize transactions you need to scan this QR Code
            with your Google Authentication App
          </DialogDescription>
        </DialogHeader>
        <div className="relative mx-auto size-40 rounded-lg border">
          {qrCode && (
            <Image src={qrCode} alt="Two FA QRCode" width={160} height={160} />
          )}
        </div>
        <div className="flex items-center">
          <div className="flex-1 border-t"></div>
          <p className="mx-2 text-xs text-muted-foreground">
            or enter the code manually
          </p>
          <div className="flex-1 border-t"></div>
        </div>
        <div className="h-10 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-center text-sm dark:bg-gray-600 dark:text-gray-100">
          <p>{secretKey}</p>
        </div>
        <Button className="w-full" onClick={() => nextStep()}>
          Next
        </Button>
      </motion.div>
    );
  };

  const Step2 = () => {
    const queryClient = useQueryClient();
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [otpCode, setOtpCode] = useState<string>('');

    const handleChangeOtpCode = async (code: string) => {
      setOtpCode(code);
      setErrorMessage('');
    };

    const {
      isPending: isVerifyingTwoFactorAuthCode,
      mutate: verifyTwoFactorAuthCode
    } = useMutation({
      mutationFn: async () => {
        const response = await userService.enable2FA({ otpCode });
        return response;
      },
      onSuccess: async (response) => {
        await queryClient.invalidateQueries({
          queryKey: [EQueryKey.USER_PROFILE]
        });
        showSuccessToast(response.message);
        setOpen(false);
      },
      onError: (error) => {
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
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4"
      >
        <DialogHeader>
          <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter the verification code from Google Authenticator.
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
        <div className="flex w-full justify-end gap-2">
          <Button variant="outline" onClick={() => previousStep()}>
            Back
          </Button>
          <Button
            disabled={otpCode.length < 6}
            onClick={() => verifyTwoFactorAuthCode()}
            isLoading={isVerifyingTwoFactorAuthCode}
          >
            Verify
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="overflow-hidden sm:max-w-[425px]"
        forceMount
        onInteractOutside={(e) => e.preventDefault()}
      >
        <AnimatePresence mode="wait">
          {currentStep === 0 ? <Step1 key="step1" /> : <Step2 key="step2" />}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default EnableTwoFADialog;
