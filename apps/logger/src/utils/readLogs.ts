import { CloudWatchLogsClient, GetLogEventsCommand, DescribeLogStreamsCommand } from '@aws-sdk/client-cloudwatch-logs';

// Only create client if CloudWatch is enabled
const getCloudWatchClient = () => {
    if (process.env.ENABLE_CLOUDWATCH !== 'true') {
        return null;
    }

    const config: any = {
        region: process.env.AWS_REGION || 'eu-west-2',
        // AWS credentials for CloudWatch (works for both local and Docker)
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    };

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
            logGroupName: process.env.LOG_GROUP_NAME || '/microservices/logger',
            orderBy: 'LastEventTime',
            descending: true,
        }));

        // Get logs from the latest stream
        if (streams.logStreams && streams.logStreams.length > 0) {
            const streamName = streams.logStreams[0].logStreamName;

            const logs = await client.send(new GetLogEventsCommand({
                logGroupName: process.env.LOG_GROUP_NAME || '/microservices/logger',
                logStreamName: streamName,
                startFromHead: false, // Start from the end (newest logs)
            }));

            // Reverse the events array to show latest logs first
            const reversedEvents = logs.events ? [...logs.events].reverse() : [];
            return reversedEvents;
        }
        return [];
    } catch (error) {
        console.error('Error fetching logs from CloudWatch:', error);
        console.log('Falling back to local log files.');
        return [];
    }
}