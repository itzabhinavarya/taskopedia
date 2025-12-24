import { createLogger, format, transports } from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

// Get CloudWatch configuration from environment
const enableCloudWatch = process.env.ENABLE_CLOUDWATCH === 'true';

// Base transports (always enabled)
const baseTransports: any[] = [
    new transports.Console(),
];

// Conditionally add CloudWatch transport
if (enableCloudWatch) {
    const cloudWatchConfig: any = {
        logGroupName: '/microservices/logger',
        logStreamName: process.env.LOG_STREAM_NAME || `logger-${process.env.NODE_ENV || 'dev'}`,
        awsRegion: process.env.AWS_REGION,
        jsonMessage: true,
        // AWS credentials for local execution
        awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
        awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
    const cloudWatchTransport = new WinstonCloudWatch(cloudWatchConfig);
    cloudWatchTransport.on('error', (err) => {
        console.error('CloudWatch transport error:', err);
    });
    baseTransports.push(cloudWatchTransport);
}

export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json(),
    ),
    transports: baseTransports,
});
