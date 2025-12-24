import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    disableErrorMessages: false,
    whitelist: true,
    transform: true,
    // This will throw BadRequestException for validation errors
    exceptionFactory: (errors) => {
      const messages = errors.map(error =>
        Object.values(error.constraints || {}).join(', ')
      );
      return new BadRequestException(messages);
    },

  }));
  // Exception filter is registered via APP_FILTER in AppModule
  await app.listen(process.env.API_PORT ?? 4000);
}
bootstrap();
