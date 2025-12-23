import { PrismaService } from '../prisma/prisma.service';

interface LogInfo {
    level: string;
    message: string;
    userId?: number;
    meta?: Record<string, any>;
    timestamp?: string;
    [key: string]: any;
}

export class PostgresTransport {
    private prisma: PrismaService;

    constructor(prisma: PrismaService) {
        this.prisma = prisma;
    }

    async log(info: LogInfo) {
        try {
            // Extract userId from meta if present
            const userId = info.userId || info.meta?.userId || null;
            const level = info.level || 'info';
            const message = info.message || JSON.stringify(info);
            const status = 'active';
            
            // Prepare metadata (exclude userId as it's a separate field)
            const metadata: any = { ...info.meta };
            if (metadata.userId) {
                delete metadata.userId;
            }
            
            // Add any additional fields from info
            Object.keys(info).forEach(key => {
                if (!['level', 'message', 'userId', 'meta', 'timestamp', 'splat'].includes(key)) {
                    metadata[key] = info[key];
                }
            });

            await (this.prisma as any).log.create({
                data: {
                    userId: userId ? parseInt(String(userId)) : null,
                    level: level,
                    message: message,
                    status: status,
                    metadata: Object.keys(metadata).length > 0 ? metadata : null,
                },
            });
        } catch (error) {
            console.error('Error writing log to database:', error);
        }
    }
}

