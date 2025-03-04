import {
  TFileValidationErrorMessages,
  TFileValidationOptions
} from 'src/types/file-validation.type';

export const validateUploadFiles = (
  files: File[],
  uploadedFileLength: number,
  validateOptions: TFileValidationOptions = {
    maxFiles: 1,
    maxFileSize: 25 * 1024 * 1024,
    acceptedFileTypes: []
  },
  errorMessage?: TFileValidationErrorMessages
) => {
  let validateErrorMessage = '';
  const {
    maxFiles = 1,
    maxFileSize = 25 * 1024 * 1024,
    acceptedFileTypes = []
  } = validateOptions;

  if (files.length > maxFiles || uploadedFileLength + files.length > maxFiles) {
    validateErrorMessage =
      errorMessage?.maxFilesErrorMessage ||
      `You can only upload ${maxFiles} files at a time`;
  }

  if (acceptedFileTypes.length) {
    const isInvalidFileType = files.some((file) => {
      const fileType = file.type;
      return !acceptedFileTypes.includes(fileType);
    });
    if (isInvalidFileType) {
      validateErrorMessage =
        errorMessage?.acceptedFileTypesErrorMessage ||
        `Invalid file type. Only ${acceptedFileTypes.join(', ')} are accepted`;
    }
  }

  const isOverSize = files.some((file) => file.size > maxFileSize);
  if (isOverSize) {
    validateErrorMessage =
      errorMessage?.maxFileSizeErrorMessage ||
      `File size should not exceed ${maxFileSize / 1024 / 1024}MB`;
  }

  return {
    isValid: !validateErrorMessage,
    errorMessage: validateErrorMessage
  };
};
