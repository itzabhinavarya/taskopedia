// src/common/filters/all-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger
} from '@nestjs/common';
import { Response } from 'express';
import { errorResponse } from 'src/utils/response';
import { LoggerClient } from 'src/infrastructure/logger.client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly loggerClient: LoggerClient) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';
        let error = 'Internal Server Error';

        // Handle Prisma errors by checking error name
        if (this.isPrismaError(exception)) {
            const prismaError = this.handlePrismaError(exception);
            statusCode = prismaError.statusCode;
            message = prismaError.message;
            error = prismaError.error;

            // Log error
            this.logger.error(`Prisma known request error: ${(exception as any).code} - ${prismaError.message}`);
            this.loggerClient.log(`Prisma error: ${(exception as any).code} - ${prismaError.message}`, 'error');
        }
        // Handle Prisma validation errors
        else if (this.isPrismaValidationError(exception)) {
            statusCode = HttpStatus.BAD_REQUEST;
            message = 'Validation error in request data';
            error = 'Bad Request';
            this.logger.error('Prisma validation error', (exception as any).message);
            this.loggerClient.log(`Prisma validation error: ${(exception as any).message}`, 'error');
        }
        // Handle HTTP exceptions
        else if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const errorResponseData = exception.getResponse();

            if (typeof errorResponseData === 'object') {
                message = (errorResponseData as any).message || message;
                error = (errorResponseData as any).error || error;
            } else {
                message = errorResponseData;
            }

            this.logger.error(`HTTP exception: ${statusCode} - ${message}`);
            this.loggerClient.log(`HTTP exception: ${statusCode} - ${message}`, 'error');
        }
        // Handle regular JavaScript errors
        else if (exception instanceof Error) {
            message = exception.message;
            error = 'Error';
            this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
            this.loggerClient.log(`Unhandled exception: ${exception.message}`, 'error');
        }
        // Handle unknown exceptions
        else {
            this.logger.error('Unknown exception occurred', exception);
            this.loggerClient.log(`Unknown exception: ${JSON.stringify(exception)}`, 'error');
        }

        const result = errorResponse(
            statusCode,
            message,
            error,
        );

        response.status(statusCode).json(result);
    }

    private isPrismaError(exception: unknown): boolean {
        return (
            typeof exception === 'object' &&
            exception !== null &&
            'code' in exception &&
            'meta' in exception &&
            (exception as any).constructor.name === 'PrismaClientKnownRequestError'
        );
    }

    private isPrismaValidationError(exception: unknown): boolean {
        return (
            typeof exception === 'object' &&
            exception !== null &&
            (exception as any).constructor.name === 'PrismaClientValidationError'
        );
    }

    private handlePrismaError(exception: any): {
        statusCode: number;
        message: string;
        error: string;
    } {
        const modelName = (exception.meta?.modelName as string) || 'Record';
        const cause = (exception.meta?.cause as string) || 'Internal Server Error';

        switch (exception.code) {
            case 'P2000':
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'The provided value is too long for the field ' + cause,
                    error: 'Bad Request',
                };
            case 'P2001':
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: `${modelName} does not exist, ${cause}`,
                    error: 'Not Found',
                };
            case 'P2002':
                const target = (exception.meta?.target as string[]) || [];
                return {
                    statusCode: HttpStatus.CONFLICT,
                    message: `${modelName} with this ${target.join(', ')} already exists, ${cause}`,
                    error: 'Conflict',
                };
            case 'P2003':
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Foreign key constraint failed ' + cause,
                    error: 'Bad Request',
                };
            case 'P2025':
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: `${cause}`,
                    error: 'Not Found',
                };
            case 'P2016':
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Query interpretation error ' + cause,
                    error: 'Bad Request',
                };
            case 'P2021':
                return {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'The table does not exist in the database ' + cause,
                    error: 'Internal Server Error',
                };
            case 'P2022':
                return {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'The column does not exist in the database ' + cause,
                    error: 'Internal Server Error',
                };
            default:
                this.logger.error(`Unhandled Prisma error code: ${exception.code}`, exception.message);
                this.loggerClient.log(`Unhandled Prisma error code: ${exception.code} - ${exception.message}`, 'error');
                return {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Database operation failed ' + cause,
                    error: 'Internal Server Error',
                };
        }
    }
}
