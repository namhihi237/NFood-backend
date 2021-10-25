import appRoot from 'app-root-path';
import winston, { format, level } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  switch (level) {
    case 'info':
      return `${level}]: ${timestamp}  ${message}`;
    case 'debug':
      return `\x1b[35m[${level}]: ${timestamp}  ${message}`;
    case 'warn':
      return `\x1b[33m[${level}]: ${timestamp}  ${message}`;
    case 'error':
      return `\x1b[31m[${level}]: ${timestamp}  ${message}`;
  }
});

const options = {
  file: {
    filename: `${appRoot}/logs/delivery.log`,
    maxFiles: 25,
    datePattern: '.YYYY-MM-DD',
    maxSize: '20m',
    handleExceptions: true
  },
  console: {
    handleExceptions: true,
    json: false,
    colorize: true
  }
};

const logger = winston.createLogger({
  format: combine(timestamp(), myFormat),
  exitOnError: false, // do not exit on handled exceptions
});

logger.configure({
  level: 'info',
  transports: [new winston.transports.Console(options.console), new DailyRotateFile(options.file)]
});

export default logger;
