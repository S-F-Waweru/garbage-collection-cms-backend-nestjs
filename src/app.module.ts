import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from './modules/clients/clients.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ExpensesModule } from './modules/expences/expences.module';
import { OtherIncomeModule } from './modules/other-income/other-income.module';
import { ReportsModule } from './modules/reports/reports.module';
import { LocationModule } from './modules/location/location.module';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlModule } from 'nest-access-control';
import { roles } from './modules/auth/policies/rbac.policy';
import { ConfigModule } from '@nestjs/config';
import { IncomeRecordSchema } from './modules/other-income/income-record/infrastructure/schema/income-record.schema';
import { RefreshTokenSchema } from './modules/auth/infrastructure/persistence/schema/refresh-token.schema';
import { UserSchema } from './modules/auth/infrastructure/persistence/schema/user.schema';
import { LocationSchema } from './modules/location/infrastracture/persistence/schema/location.schema';
import { IncomeCategorySchema } from './modules/other-income/income-category/infrastructure/schema/IncomeCategory.schema';
import { PettyCashSchema } from './modules/expences/petty-cash/infrastructure/petty-cash-schema';
import { ExpenseSchema } from './modules/expences/expence/infrastructure/expense.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // <-- this makes it global
      envFilePath: '.env', // optional: specify your .env file path
    }),
    AccessControlModule.forRoles(roles),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'gm_client_cms_db',
        entities: [
          IncomeRecordSchema,
          RefreshTokenSchema,
          UserSchema,
          LocationSchema,
          IncomeCategorySchema,
          PettyCashSchema,
          ExpenseSchema,
        ],
        synchronize: true,
        logging: true,
      }),
    }),
    ClientsModule,
    InvoicesModule,
    PaymentsModule,
    ExpensesModule,
    OtherIncomeModule,
    ReportsModule,
    LocationModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
