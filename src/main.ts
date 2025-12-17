// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();


  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Garbage Collection Management API')
    .setDescription('API for managing clients, billing, payments, and expenses')
    .setVersion('1.0')
    .addTag('Invoices', 'Invoice management endpoints')
    .addTag('Payments', 'Payment management endpoints')
    .addTag('Clients', 'Client management endpoints')
    .addTag('Expenses', 'Expense management endpoints')
    .addBearerAuth() // Add JWT authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Swagger UI at /api/docs

  await app.listen(process.env.PORT ?? 3300);
  console.log('Application is running on: http://localhost:3300');
  console.log('Swagger UI available at: http://localhost:3300/api/docs');
}
bootstrap();
