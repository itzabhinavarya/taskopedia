import { CloudWatchLogsClient, GetLogEventsCommand, DescribeLogStreamsCommand } from '@aws-sdk/client-cloudwatch-logs';

// Only create client if CloudWatch is enabled
const getCloudWatchClient = () => {
    if (process.env.ENABLE_CLOUDWATCH !== 'true') {
        return null;
    }

    const config: any = {
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
        },
    };

    // Add LocalStack endpoint if enabled
    if (process.env.LOCALSTACK_ENABLED === 'true') {
        config.endpoint = process.env.LOCALSTACK_ENDPOINT || 'http://localstack:4566';
    }

    return new CloudWatchLogsClient(config);
};

const client = getCloudWatchClient();

export async function getLogs() {
    if (!client) {
        console.log('CloudWatch is not enabled. Reading from local log files instead.');
        return;
    }

    try {
        // First, get the log streams
        const streams = await client.send(new DescribeLogStreamsCommand({
            logGroupName: '/microservices/logger',
            orderBy: 'LastEventTime',
            descending: true,
        }));

        // Get logs from the latest stream
        if (streams.logStreams && streams.logStreams.length > 0) {
            const streamName = streams.logStreams[0].logStreamName;

            const logs = await client.send(new GetLogEventsCommand({
                logGroupName: '/microservices/logger',
                logStreamName: streamName,
            }));

            console.log('Logs:', JSON.stringify(logs.events, null, 2));
        }
    } catch (error) {
        console.error('Error fetching logs from CloudWatch:', error);
        console.log('Falling back to local log files.');
    }
}