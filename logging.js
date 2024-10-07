const winston = require("winston");
const { combine, timestamp, printf } = winston.format;

let prettyFormat = combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(({ level, message, serviceName, timestamp }) => {
        // const paddedServiceName = `[${serviceName}]`.padEnd(15);
        const paddedServiceName = `[${serviceName}]`;
        return `[${timestamp}][${level.toUpperCase()}]${paddedServiceName} ${message}`;
    })
);

let jsonFormat = combine(
    timestamp(),
    winston.format.json()
)

const logger = winston.createLogger({
    level: 'info',
    format: jsonFormat,
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'all.log' }),
        new winston.transports.Console({ format: prettyFormat }),
    ],
});

exports.logger = logger;