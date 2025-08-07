'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import PlayholderContent from 'src/components/ui/layouts/content/PlayholderContent';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from 'src/components/ui/shadcn-ui/avatar';
import { Button } from 'src/components/ui/shadcn-ui/button';
import { Form, FormField } from 'src/components/ui/shadcn-ui/form';
import FormItemInput from 'src/components/ui/shared/form/FormItemInput';
import LoadingStatus from 'src/components/ui/shared/status/LoadingStatus';
import UploadFileButton from 'src/components/ui/shared/UploadFileButton';
import { EQueryKey } from 'src/constants/enum';
import { AVATAR_MAX_FILE_SIZE } from 'src/constants/variables';
import useGetUserProfile from 'src/hooks/cache/useGetUserProfile';
import { userService } from 'src/services';
import { TEditProfileForm } from 'src/types/form.type';
import { showErrorToast, showSuccessToast } from 'src/utils/toast.util';
import { EditProfileFormValidationSchema } from 'src/utils/validations/form-validation';

const ProfileSettingPage = () => {
  const queryClient = useQueryClient();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { isLoading: isGettingUserProfile, data: user } = useGetUserProfile();
  const form = useForm<TEditProfileForm>({
    resolver: zodResolver(EditProfileFormValidationSchema)
  });

  const { isPending: isUpdatingProfile, mutate: updateProfile } = useMutation({
    mutationFn: async (formValues: TEditProfileForm) => {
      const formData = new FormData();
      formData.append('fullName', formValues.fullName || '');
      if (formValues.avatar) {
        formData.append('avatar', formValues.avatar);
      }
      return userService.updateUserProfile(formData);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: [EQueryKey.USER_PROFILE]
      });
      form.reset({
        fullName: response.updatedUser.fullName,
        avatar: undefined
      });
      showSuccessToast(response.message);
    },
    onError: () => {
      showErrorToast('Update profile failed!');
    }
  });

  const onSubmitEditProfileForm = async (data: TEditProfileForm) => {
    updateProfile(data);
  };

  const handleAvatarChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setAvatarValue: (...event: any[]) => void
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setAvatarValue(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (user) {
      form.reset({ fullName: user.fullName, avatar: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col py-8">
      <h1 className="mb-4 text-2xl font-bold">Edit your profile</h1>
      <PlayholderContent className="flex-1">
        {isGettingUserProfile ? (
          <LoadingStatus />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEditProfileForm)}>
              <div className="flex max-w-sm flex-col gap-4">
                <div className="flex items-center gap-x-2">
                  <Avatar className="size-20">
                    <AvatarImage
                      src={avatarPreview || user?.avatar}
                      alt="Avatar"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="grid w-full items-center gap-1.5">
                    <FormField
                      control={form.control}
                      name="avatar"
                      render={({ field: { ref, value, onChange } }) => (
                        <UploadFileButton
                          onFileChange={(e) => handleAvatarChange(e, onChange)}
                          variant="outline"
                          size="default"
                          maxFileSize={AVATAR_MAX_FILE_SIZE}
                          acceptedFileTypes={[
                            'image/jpeg',
                            'image/png',
                            'image/jpg'
                          ]}
                        >
                          Upload avatar
                        </UploadFileButton>
                      )}
                    />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field: { ref, ...fields } }) => (
                    <FormItemInput
                      id="fullName"
                      label="Full name"
                      {...fields}
                    />
                  )}
                />
                <Button
                  type="submit"
                  disabled={!form.formState.isDirty}
                  isLoading={isUpdatingProfile}
                >
                  Update
                </Button>
              </div>
            </form>
          </Form>
        )}
      </PlayholderContent>
    </div>
  );
};

export default ProfileSettingPage;
