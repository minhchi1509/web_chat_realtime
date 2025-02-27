import { FileIcon } from 'lucide-react';
import React, { FC, useRef } from 'react';

import { Button, ButtonProps } from 'src/components/ui/shadcn-ui/button';
import { showErrorToast } from 'src/utils/toast.util';

interface IUploadFileButtonProps extends ButtonProps {
  className?: string;
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void | Promise<void>;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  maxFileSize?: number;
  maxFiles?: number;
  acceptedFileTypes?: string[];
  uploadedFilesLength?: number;
}

const UploadFileButton: FC<IUploadFileButtonProps> = ({
  children,
  inputProps,
  onFileChange,
  maxFileSize = 25 * 1024 * 1024,
  maxFiles = 1,
  acceptedFileTypes,
  uploadedFilesLength,
  ...buttonProps
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBtnClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;
    if (
      fileList.length > maxFiles ||
      (uploadedFilesLength && uploadedFilesLength + fileList.length > maxFiles)
    ) {
      showErrorToast(`You can only upload ${maxFiles} files at a time`);
      return;
    }
    if (acceptedFileTypes) {
      const isInvalidFileType = Array.from(fileList).some((file) => {
        const fileType = file.type;
        return !acceptedFileTypes.includes(fileType);
      });
      if (isInvalidFileType) {
        showErrorToast('Invalid file type');
        return;
      }
    }
    const files = Array.from(fileList);
    const isOverSize = files.some((file) => file.size > maxFileSize);
    if (isOverSize) {
      showErrorToast(
        `File size should not exceed ${maxFileSize / 1024 / 1024}MB`
      );
      return;
    }
    onFileChange(event);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        {...buttonProps}
        onClick={handleBtnClick}
        aria-label="Upload file"
        type="button"
      >
        {children || <FileIcon className="size-4" />}
      </Button>
      <input
        {...inputProps}
        type="file"
        multiple={maxFiles > 1}
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  );
};

export default UploadFileButton;
