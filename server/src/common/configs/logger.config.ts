import { createLogger, format, LoggerOptions, transports } from 'winston';

const defaultFormat = format.combine(
  format.json(),
  format.timestamp({ format: 'DD/MM/YYYY, HH:mm:ss    ' }),
  format.label({ label: 'NestServer' }),
  format.printf((info) => {
    const { label, timestamp, level, context, message } = info;
    return `[${label}] - ${timestamp}[${level}] [${context}] ${message}`;
  })
);

export const loggerOptions: LoggerOptions = {
  level: 'silly',
  format: format.combine(format.colorize({ all: true }), defaultFormat),
  transports: [new transports.Console()]
};

export const winstonLogger = createLogger(loggerOptions);
