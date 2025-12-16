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
import { IPaymentRepository } from './domain/payment.repositiory.interface';
import { InvoiceModule } from '../invoices/invoices.module';
import { ClientModule } from '../clients/client/client.module';
import { ClientCreditModule } from '../client-credit/client-credit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentSchema]),
    InvoiceModule,
    ClientModule,
    ClientCreditModule,
  ],
  providers: [
    // Repository
    {
      provide: IPaymentRepository,
      useClass: PaymentRepository,
    },

    // Use Cases
    RecordPaymentUseCase,
    GetPaymentUseCase,
    ListPaymentsUseCase,
  ],
  controllers: [PaymentController],
  exports: [IPaymentRepository],
})
export class PaymentModule {}
