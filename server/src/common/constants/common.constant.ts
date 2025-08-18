import emojiRegex from 'emoji-regex';

export const DEFAULT_USER_AVATAR_URL =
  'https://res.cloudinary.com/dwmx5jqgh/image/upload/v1721573394/avatar/default-avatar_ug6r38.jpg';
export const REDIS_MAX_RETRY = 3;

export const EMOJI_REGEX = new RegExp(`^(?:${emojiRegex().source}|\\s)*$`, 'u');
