import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { apiProxy } from './routes/api-proxy';
import { loggerProxy } from './routes/logger-proxy';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Logger service routes - must be before API routes to avoid conflicts
  app.use('/api/logs', loggerProxy);
  
  // API service routes
  app.use('/api', apiProxy);
  
  await app.listen(process.env.GATEWAY_PORT ?? 3000);
}
bootstrap();
