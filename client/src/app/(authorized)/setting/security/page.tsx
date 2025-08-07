'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { AuthenticatorAppIcon } from 'src/assets/icons';
import DisableTwoFADialog from 'src/components/ui/features/two-fa/DisableTwoFADialog';
import EnableTwoFADialog from 'src/components/ui/features/two-fa/EnableTwoFADialog';
import PlayholderContent from 'src/components/ui/layouts/content/PlayholderContent';
import { Button } from 'src/components/ui/shadcn-ui/button';
import { Form, FormField } from 'src/components/ui/shadcn-ui/form';
import { Switch } from 'src/components/ui/shadcn-ui/switch';
import FormItemInput from 'src/components/ui/shared/form/FormItemInput';
import LoadingStatus from 'src/components/ui/shared/status/LoadingStatus';
import useGetUserProfile from 'src/hooks/cache/useGetUserProfile';
import { userService } from 'src/services';
import { TChangePasswordForm } from 'src/types/form.type';
import { showErrorToast, showSuccessToast } from 'src/utils/toast.util';
import { ChangePasswordFormValidationSchema } from 'src/utils/validations/form-validation';

const SecuritySettingPage = () => {
  const [openEnable2FADialog, setOpenEnable2FADialog] = useState(false);
  const [openDisable2FADialog, setOpenDisable2FADialog] = useState(false);
  const [isEnableTwoFactorAuth, setIsEnableTwoFactorAuth] = useState(false);
  const { data: userProfile, isLoading } = useGetUserProfile();
  const form = useForm<TChangePasswordForm>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    },
    resolver: zodResolver(ChangePasswordFormValidationSchema)
  });

  const { isPending: isChangingPassword, mutate: triggerChangePassword } =
    useMutation({
      mutationFn: async (data: TChangePasswordForm) => {
        const responseData = await userService.changePassword({
          oldPassword: data.currentPassword,
          newPassword: data.newPassword
        });
        return responseData;
      },
      onSuccess: (response) => {
        showSuccessToast(response.message);
        form.reset();
      },
      onError: (error) => {
        showErrorToast(error.message);
      }
    });

  const handleChangePassword = async (data: TChangePasswordForm) => {
    triggerChangePassword(data);
  };

  const handleToggleSwitch = (checked: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    checked ? setOpenEnable2FADialog(true) : setOpenDisable2FADialog(true);
  };

  useEffect(() => {
    if (userProfile) {
      setIsEnableTwoFactorAuth(userProfile.isEnableTwoFactorAuth);
    }
  }, [userProfile]);

  if (isLoading || !userProfile) {
    return <LoadingStatus />;
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col py-8">
      <h1 className="mb-4 text-2xl font-bold">Security setting</h1>
      <PlayholderContent className="flex-1">
        <div className="max-w-sm">
          <h1 className="mb-4 text-xl font-semibold text-muted-foreground">
            Change password
          </h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleChangePassword)}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field: { ref, ...fieldProps } }) => (
                    <FormItemInput
                      id="currentPassword"
                      type="password"
                      label="Current password"
                      {...fieldProps}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field: { ref, ...fieldProps } }) => (
                    <FormItemInput
                      id="newPassword"
                      type="password"
                      label="New password"
                      {...fieldProps}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmNewPassword"
                  render={({ field: { ref, ...fieldProps } }) => (
                    <FormItemInput
                      id="confirmNewPassword"
                      type="password"
                      label="Confirm new password"
                      {...fieldProps}
                    />
                  )}
                />
                <Button type="submit" isLoading={isChangingPassword}>
                  Change password
                </Button>
              </div>
            </form>
          </Form>
          <h1 className="my-4 text-xl font-semibold text-muted-foreground">
            Two-factor authentication
          </h1>
          <div className="flex items-center gap-2">
            <AuthenticatorAppIcon height={50} />
            <div className="flex-1">
              <p className="text-sm">Authenticator app</p>
              <p className="text-xs text-muted-foreground">
                Use an authentication app or browser extension to get two-factor
                authentication codes when prompted.
              </p>
            </div>
            <div>
              <Switch
                checked={isEnableTwoFactorAuth}
                onCheckedChange={handleToggleSwitch}
              />
            </div>
          </div>
        </div>
      </PlayholderContent>
      {openEnable2FADialog && (
        <EnableTwoFADialog
          open={openEnable2FADialog}
          setOpen={setOpenEnable2FADialog}
        />
      )}
      {openDisable2FADialog && (
        <DisableTwoFADialog
          open={openDisable2FADialog}
          setOpen={setOpenDisable2FADialog}
        />
      )}
    </div>
  );
};

export default SecuritySettingPage;
