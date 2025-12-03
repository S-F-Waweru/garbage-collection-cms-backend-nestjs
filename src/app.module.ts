import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ExpencesModule } from './modules/expences/expences.module';
import { OtherIncomeModule } from './modules/other-income/other-income.module';
import { ReportsModule } from './modules/reports/reports.module';
import { LocationModule } from './modules/location/location.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [UsersModule, ClientsModule, InvoicesModule, PaymentsModule, ExpencesModule, OtherIncomeModule, ReportsModule, LocationModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
