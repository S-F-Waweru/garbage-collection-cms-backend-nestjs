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
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'gm_client_cms_db',
        entities: [__dirname + '/**/*.schema{.ts,.js}'],
        // synchronize: process.env.NODE_ENV !== 'production',
        // logging: process.env.NODE_ENV === 'development',
        synchronize: true,
        logging: true,
      }),
    }),
    UsersModule,
    ClientsModule,
    InvoicesModule,
    PaymentsModule,
    ExpencesModule,
    OtherIncomeModule,
    ReportsModule,
    LocationModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
