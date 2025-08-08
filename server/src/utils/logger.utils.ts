import dotenv from "dotenv";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

dotenv.config();

const isDevelopment = process.env.NODE_ENV === "development";

const logger = winston.createLogger({
  level: isDevelopment ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Rotating error logs
    new DailyRotateFile({
      filename: path.join(__dirname, "../../logs/error-%DATE%.log"),
      level: "error",
      datePattern: "YYYY-MM-DD",
    }),

    // Rotating combined logs
    new DailyRotateFile({
      filename: path.join(__dirname, "../../logs/combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
    }),

    // Console transport remains the same
    new winston.transports.Console({
      level: isDevelopment ? "debug" : "info",
      format: isDevelopment
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(
              ({ level, message, timestamp, ...metadata }) => {
                let msg = `${timestamp} [${level}]: ${message}`;
                if (Object.keys(metadata).length > 0) {
                  msg += ` ${JSON.stringify(metadata, null, 2)}`;
                }
                return msg;
              }
            )
          )
        : winston.format.simple(),
    }),
  ],
});

// Development enhancements
if (isDevelopment) {
  console.log = (...args) => logger.debug(`CONSOLE| ${args.join(" ")}`);
}

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection:", reason);
});

export default logger;
