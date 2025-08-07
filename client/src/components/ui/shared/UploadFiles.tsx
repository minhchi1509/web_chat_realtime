import React, { FC, HTMLAttributes, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

import { showErrorToast } from 'src/utils/toast.util';
import { validateUploadFiles } from 'src/utils/validations/file-validation';

interface IValidationOptions {
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
}

interface IValidationFailedMessage {
  maxFilesErrorMessage?: string;
  maxFileSizeErrorMessage?: string;
  acceptedFileTypesErrorMessage?: string;
}

interface IUploadFilesProps {
  draggable?: boolean;
  onUploadSuccess?: (files: File[]) => void;
  containerClassName?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  validationOptions?: IValidationOptions;
  uploadedFilesLength?: number;
  children:
    | React.ReactNode
    | (({ isDragActive }: { isDragActive: boolean }) => React.ReactNode);
  errorMessage?: IValidationFailedMessage;
}

const UploadFiles: FC<IUploadFilesProps> = ({
  draggable,
  onUploadSuccess,
  containerClassName,
  inputProps,
  uploadedFilesLength,
  errorMessage,
  children,
  validationOptions = {
    acceptedFileTypes: [],
    maxFiles: 1,
    maxFileSize: 25 * 1024 * 1024
  }
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { acceptedFileTypes, maxFiles } = validationOptions;
  const { getRootProps, isDragActive } = useDropzone({
    onDrop: async (files: File[]) => {
      handleChangeFiles(files);
    }
  });
  const handleChangeFiles = (files: File[]) => {
    const { isValid, errorMessage: validationFailedMessage } =
      validateUploadFiles(
        Array.from(files),
        uploadedFilesLength || 0,
        {
          ...validationOptions
        },
        errorMessage
      );
    if (!isValid) {
      showErrorToast(validationFailedMessage);
      return;
    }
    onUploadSuccess?.(Array.from(files));
  };

  const rootContainerProps: HTMLAttributes<HTMLDivElement> = {
    onClick: () => fileInputRef.current?.click(),
    className: containerClassName
  };

  return (
    <div
      {...(draggable
        ? getRootProps({ ...rootContainerProps })
        : { ...rootContainerProps })}
    >
      <input
        {...inputProps}
        type="file"
        style={{ display: 'none' }}
        multiple={maxFiles! > 1}
        ref={fileInputRef}
        accept={
          acceptedFileTypes?.length ? acceptedFileTypes?.join(',') : '*/*'
        }
        onChange={(e) => {
          const fileList = e.target.files;
          if (!fileList) return;
          handleChangeFiles(Array.from(fileList));
        }}
      />
      {typeof children === 'function' ? children({ isDragActive }) : children}
    </div>
  );
};

export default UploadFiles;
