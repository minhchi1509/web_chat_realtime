export type TFileValidationOptions = {
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
};

export type TFileValidationErrorMessages = {
  maxFilesErrorMessage?: string;
  maxFileSizeErrorMessage?: string;
  acceptedFileTypesErrorMessage?: string;
};
