import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from 'prisma/prisma.module';
import { LoggerModule } from './infrastructure/logger.module';
import { ConfigModule } from '@nestjs/config';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AllExceptionsFilter } from './utils/http-exception.filter';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: "../../../.env",
  }),
    PrismaModule,
    UserModule,
    LoggerModule,
    ProjectModule,
    TaskModule,
    DashboardModule
  ], // LoggerModule available globally
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule { }
