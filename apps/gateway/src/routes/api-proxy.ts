import { createProxyMiddleware } from 'http-proxy-middleware';

const apiUrl = process.env.API_URL || 'http://localhost:4000';

// Validate API_URL to prevent proxying to Gateway's own port
if (apiUrl.includes(':3000')) {
    console.error('❌ ERROR: API_URL cannot point to port 3000 (Gateway port).');
    console.error('   Please set API_URL to http://localhost:4000 in your .env file');
    console.error(`   Current API_URL: ${apiUrl}`);
    throw new Error('Invalid API_URL configuration: Cannot proxy to Gateway port 3000');
}

console.log(`✅ Gateway proxy configured to forward /api/* requests to: ${apiUrl}`);
console.log(`   Make sure API service is running on ${apiUrl}`);

export const apiProxy = createProxyMiddleware({
    target: apiUrl,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
});