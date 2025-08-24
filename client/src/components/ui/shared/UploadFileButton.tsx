import { FileIcon } from 'lucide-react';
import React, { FC, useEffect, useRef } from 'react';

import { Button, ButtonProps } from 'src/components/ui/shadcn-ui/button';
import { showErrorToast } from 'src/utils/toast.util';
import { validateUploadFiles } from 'src/utils/validations/file-validation';

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
    const { isValid, errorMessage } = validateUploadFiles(
      Array.from(fileList),
      uploadedFilesLength || 0,
      {
        maxFiles,
        maxFileSize,
        acceptedFileTypes
      }
    );
    if (!isValid) {
      showErrorToast(errorMessage);
      return;
    }
    onFileChange(event);

    // Reset input value sau khi xử lý để cho phép chọn lại cùng file
    event.target.value = '';
  };

  // --- thêm handler cho paste ---
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const files = Array.from(e.clipboardData.files);
      if (files.length === 0) return;

      // Fake input event để tái sử dụng handleFileChange
      const dataTransfer = new DataTransfer();
      files.forEach((f) => dataTransfer.items.add(f));

      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;

        const changeEvent = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(changeEvent);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

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
