import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import axios from 'axios';
import type { Request } from 'express';
import type { JwtPayload } from './jwt.service';

@Injectable({ scope: Scope.REQUEST })
export class LoggerClient {
    private baseUrl = process.env.LOGGER_URL;

    constructor(@Inject(REQUEST) private readonly request: Request) {}

    /**
     * Automatically extracts userId from request.user (set by AuthGuard)
     * and includes it in the log metadata.
     * If userId is manually passed in meta, it takes priority.
     */
    log(message: string, level: string = 'info', meta?: any) {
        try {
            // Extract user info from request (set by AuthGuard)
            const user = (this.request as any).user as JwtPayload | undefined;
            
            // Merge user info with provided metadata
            // Priority: manually passed userId > request.user.userId
            const logMeta = {
                ...meta,
                // Only add userId from request.user if not already provided in meta
                ...(!meta?.userId && user?.userId && { userId: user.userId }),
            };

            axios.post(`${this.baseUrl}/logs`, { message, level, meta: logMeta });
        } catch (error) {
            console.error('Failed to send log:', error.message);
        }
    }
}
