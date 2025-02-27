export enum EMetadataKey {
  IS_PUBLIC_ROUTE = 'IS_PUBLIC_ROUTE'
}

export enum ETokenExpiration {
  ACCESS_TOKEN = 5 * 60 * 60, // 5 hours
  REFRESH_TOKEN = 7 * 24 * 60 * 60, // 7 days
  RESET_PASSWORD_TOKEN = 5 * 60 // 5 minutes
}

export enum ELoginExceptionErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  REQUIRED_2FA_OTP = 'REQUIRED_2FA_OTP',
  INVALID_2FA_OTP = 'INVALID_2FA_OTP',
  REQUIRED_INITIALIZE_PASSWORD = 'REQUIRED_INITIALIZE_PASSWORD'
}

export enum ESortType {
  ASC = 'asc',
  DESC = 'desc'
}
