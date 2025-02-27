import Joi from 'joi';

import { IEnvironmentVariables } from 'src/common/types/env.type';

const EnvironmentVariablesValidationSchema = Joi.object<IEnvironmentVariables>({
  NODE_ENV: Joi.string().required().valid('development', 'production'),
  CLIENT_URL: Joi.string().required().uri(),
  NEST_SERVER_PORT: Joi.number().port().required(),
  DATABASE_URL: Joi.string().required(),
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
  RESET_PASSWORD_TOKEN_SECRET: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().required(),
  REDIS_PASSWORD: Joi.string().required(),
  MAIL_HOST: Joi.string().required(),
  MAIL_PASSWORD: Joi.string().required(),
  MAIL_PORT: Joi.number().port().required(),
  MAIL_USER: Joi.string().required().email(),
  CLOUDINARY_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  GOOGLE_AUTH_CLIENT_ID: Joi.string().required(),
  GOOGLE_AUTH_CLIENT_SECRET: Joi.string().required()
});

export default EnvironmentVariablesValidationSchema;
