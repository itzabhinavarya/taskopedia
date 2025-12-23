import { createLogger, format, transports } from 'winston';
import * as path from 'path';
import WinstonCloudWatch from 'winston-cloudwatch';

const logDir = path.join(process.cwd(), 'logs');

// Get CloudWatch configuration from environment
const enableCloudWatch = process.env.ENABLE_CLOUDWATCH === 'true';
const localstackEnabled = process.env.LOCALSTACK_ENABLED === 'true';
const localstackEndpoint = process.env.LOCALSTACK_ENDPOINT || 'http://localstack:4566';

// Base transports (always enabled)
const baseTransports: any[] = [
    new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(logDir, 'combined.log') }),
    new transports.Console(),
];

// Conditionally add CloudWatch transport
if (enableCloudWatch) {
    const cloudWatchConfig: any = {
        logGroupName: '/microservices/logger',
        logStreamName: process.env.LOG_STREAM_NAME || `logger-${process.env.NODE_ENV || 'dev'}`,
        awsRegion: process.env.AWS_REGION || 'ap-south-1',
        jsonMessage: true,
        awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
    };

    // Add LocalStack endpoint if enabled
    if (localstackEnabled) {
        cloudWatchConfig.awsOptions = {
            endpoint: localstackEndpoint,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
            }
        };
    }

    baseTransports.push(new WinstonCloudWatch(cloudWatchConfig));
}

export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json(),
    ),
    transports: baseTransports,
});
