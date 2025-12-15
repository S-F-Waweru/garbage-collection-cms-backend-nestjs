// payment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Presentation
import { PaymentController } from './presentation/payment.controller';
import { GetPaymentUseCase } from './application/usecases/get-payment.use-case';
import { ListPaymentsUseCase } from './application/usecases/list-payments.use-case';
import { RecordPaymentUseCase } from './application/usecases/record-payment.use-case';
import { PaymentRepository } from './infrastructure/payament.repository';
import { PaymentSchema } from './infrastructure/payment.schema';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentSchema])],
  providers: [
    // Repository
    {
      provide: 'IPaymentRepository',
      useClass: PaymentRepository,
    },

    // Use Cases
    RecordPaymentUseCase,
    GetPaymentUseCase,
    ListPaymentsUseCase,
  ],
  controllers: [PaymentController],
  exports: ['IPaymentRepository'],
})
export class PaymentModule {}
