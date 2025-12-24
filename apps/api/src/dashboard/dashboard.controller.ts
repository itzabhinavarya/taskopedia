import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from 'src/dashboard/dashboard.service';
import { LoggerClient } from 'src/infrastructure/logger.client';
import { response } from 'src/utils/response';
import { AuthGuard } from 'src/infrastructure/auth.guard';
import { GetUser } from 'src/infrastructure/get-user.decorator';
import type { JwtPayload } from 'src/infrastructure/jwt.service';

@Controller('dashboard')
export class DashboardController {

    constructor(
        private readonly service: DashboardService,
        private readonly loggerClient: LoggerClient
    ) { }

    @UseGuards(AuthGuard)
    @Get('/stats')
    async getAllStats(@GetUser() user: JwtPayload) {
        this.loggerClient.log('Fetching all stats for dashboard', 'info');
        const data = await this.service.getStats()
        this.loggerClient.log('Fetched all stats for dashboard', 'info');
        return response({
            status: true,
            statusCode: 200,
            message: 'All stats fetched successfully',
            data
        })
    }
}
