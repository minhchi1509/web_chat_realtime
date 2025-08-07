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

export const developmentLoggerOptions: LoggerOptions = {
  level: 'silly',
  format: format.combine(format.colorize({ all: true }), defaultFormat),
  transports: [new transports.Console()]
};

// Chỉ ghi lại log theo level tương ứng
const getProductionLoggerFormat = (level: string) => {
  return format.combine(
    format((info) => {
      if (info.level !== level) {
        return false;
      }
      return info;
    })()
  );
};

export const productionLoggerOptions: LoggerOptions = {
  level: 'info',
  format: defaultFormat,
  transports: [
    new transports.Console(),
    new transports.File({
      filename: 'logs/error.log',
      format: getProductionLoggerFormat('error')
    }),
    new transports.File({
      filename: 'logs/info.log',
      format: getProductionLoggerFormat('info')
    }),
    new transports.File({
      filename: 'logs/warn.log',
      format: getProductionLoggerFormat('warn')
    })
  ]
};

const loggerOptions =
  process.env.NODE_ENV === 'development'
    ? developmentLoggerOptions
    : productionLoggerOptions;

export const winstonLogger = createLogger(loggerOptions);
