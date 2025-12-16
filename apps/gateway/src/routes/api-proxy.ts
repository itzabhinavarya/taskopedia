import { createProxyMiddleware } from 'http-proxy-middleware';

export const apiProxy = createProxyMiddleware({
    target: process.env.API_URL || 'http://localhost:4000',
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
});