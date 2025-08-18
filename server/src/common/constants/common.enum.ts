export enum EMetadataKey {
  IS_PUBLIC_ROUTE = 'IS_PUBLIC_ROUTE',
  CHECK_POLICIES_KEY = 'CHECK_POLICIES_KEY'
}

export enum ETokenExpiration {
  ACCESS_TOKEN = 2 * 60 * 60, // 2 minutes
  REFRESH_TOKEN = 7 * 24 * 60 * 60, // 7 days
  RESET_PASSWORD_TOKEN = 5 * 60, // 5 minutes
  INIT_OAUTH_PASSWORD_TOKEN = 5 * 60, // 5 minutes
  TWO_FACTOR_AUTH_TOKEN = 5 * 60 // 5 minutes
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

export enum EDevicePlatform {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web'
}

export enum EMessageEmotionType {
  LIKE = 'LIKE',
  HEART = 'HEART',
  WOW = 'WOW',
  HAHA = 'HAHA',
  SAD = 'SAD',
  ANGRY = 'ANGRY'
}

export enum EStrategyName {
  JWT_HTTP = 'jwt-http',
  JWT_SOCKET = 'jwt-socket',
  GOOGLE = 'google',
  JWT_INIT_OAUTH_PASSWORD = 'jwt-init-oauth-password'
}

export enum EOAuthProvider {
  GOOGLE = 'google'
}

export enum ECookieName {
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
  TWO_FACTOR_AUTH_TOKEN = 'two_factor_auth_token'
}

export enum EHeaderKey {
  X_INIT_OAUTH_PASSWORD_TOKEN = 'x-init-oauth-password-token',
  X_RESET_PASSWORD_TOKEN = 'x-reset-password-token'
}
