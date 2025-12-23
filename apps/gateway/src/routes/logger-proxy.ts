import { createProxyMiddleware } from 'http-proxy-middleware';

const loggerUrl = process.env.LOGGER_URL || 'http://logger:4001';

// Validate LOGGER_URL to prevent proxying to Gateway's own port
if (loggerUrl.includes(':3000')) {
    console.error('❌ ERROR: LOGGER_URL cannot point to port 3000 (Gateway port).');
    console.error('   Please set LOGGER_URL to http://localhost:4001 in your .env file');
    console.error(`   Current LOGGER_URL: ${loggerUrl}`);
    throw new Error('Invalid LOGGER_URL configuration: Cannot proxy to Gateway port 3000');
}

console.log(`✅ Logger proxy configured to forward /api/logs/* requests to: ${loggerUrl}`);
console.log(`   Make sure Logger service is running on ${loggerUrl}`);

export const loggerProxy = createProxyMiddleware({
    target: loggerUrl,
    changeOrigin: true,
    // Express app.use('/api/logs', ...) automatically strips '/api/logs' prefix
    // So we receive: '/' for /api/logs, '/user/1' for /api/logs/user/1
    // We prepend '/logs' to match logger controller's @Controller('logs')
    pathRewrite: (path) => {
        if (path === '/' || path === '') {
            return '/logs';
        }
        return `/logs${path}`;
    },
});

