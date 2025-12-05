import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';
import { IncomeRecordSchema } from './modules/other-income/income-record/infrastructure/schema/income-record.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3300);
}
bootstrap();
