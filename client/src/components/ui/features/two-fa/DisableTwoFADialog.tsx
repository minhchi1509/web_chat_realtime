'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dispatch, FC, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from 'src/components/ui/shadcn-ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from 'src/components/ui/shadcn-ui/dialog';
import { Form, FormField } from 'src/components/ui/shadcn-ui/form';
import FormItemInput from 'src/components/ui/shared/form/FormItemInput';
import { EQueryKey } from 'src/constants/enum';
import { userService } from 'src/services';
import { showErrorToast, showSuccessToast } from 'src/utils/toast.util';

interface IDisableTwoFADialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const DisableTwoFADialog: FC<IDisableTwoFADialogProps> = ({
  open,
  setOpen
}) => {
  const queryClient = useQueryClient();
  const form = useForm<{ password: string }>({
    defaultValues: {
      password: ''
    },
    resolver: zodResolver(
      z.object({
        password: z.string().min(1, 'Please enter your password.')
      })
    )
  });

  const { isPending: isDisablingTwoFA, mutate: disableTwoFA } = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const response = await userService.disable2FA({ password });
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
      showErrorToast(error.message);
    }
  });

  const handleDisableTwoFA = async ({ password }: { password: string }) => {
    disableTwoFA({ password });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="overflow-hidden sm:max-w-[425px]"
        forceMount
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Please enter your password to disable two-factor authentication.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleDisableTwoFA)}>
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field: { ref, ...fieldProps } }) => (
                  <FormItemInput
                    id="password"
                    type="password"
                    label="Password"
                    {...fieldProps}
                  />
                )}
              />
              <Button
                type="submit"
                className="w-full"
                isLoading={isDisablingTwoFA}
              >
                Disable
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DisableTwoFADialog;
