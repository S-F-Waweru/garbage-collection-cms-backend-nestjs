// shared/repositories.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IClientRepository } from '../../modules/clients/client/domain/interface/client.repository.interface';
import { ClientSchema } from '../../modules/clients/client/infrastructure/perisistence/schema/client.schema';
import { BuildingSchema } from '../../modules/clients/building/infrastructure/persistense/schema/buildingSchema';
import { LocationSchema } from '../../modules/location/infrastracture/persistence/schema/location.schema';
import { ClientRepository } from '../../modules/clients/client/infrastructure/perisistence/repository/client.repository';
import { IBuildingRepository } from '../../modules/clients/building/domain/interface/buidling.repsository.interface';
import { BuildingRepository } from '../../modules/clients/building/infrastructure/persistense/repository/building.repository';
import { ILocationRepository } from '../../modules/location/domain/interface/location.repository.inteface';
import { LocationRepository } from '../../modules/location/infrastracture/persistence/repository/location.repository';
import { InvoiceSchema } from 'src/modules/invoices/infrasctructure/invoice.rschema';
import { IInvoiceRepository } from 'src/modules/invoices/domain/invoice.repository.intreface';
import { InvoiceRepository } from 'src/modules/invoices/infrasctructure/invoice.repository';
import { PaymentSchema } from 'src/modules/payments/infrastructure/payment.schema';
import { IPaymentRepository } from 'src/modules/payments/domain/payment.repositiory.interface';
import { PaymentRepository } from 'src/modules/payments/infrastructure/payament.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClientSchema,
      BuildingSchema,
      LocationSchema,
      InvoiceSchema,
      PaymentSchema
    ]),
  ],
  providers: [
    {
      provide: IClientRepository,
      useClass: ClientRepository,
    },
    {
      provide: IBuildingRepository,
      useClass: BuildingRepository,
    },
    {
      provide: ILocationRepository,
      useClass: LocationRepository,
    },
    {
      provide: IInvoiceRepository,
      useClass: InvoiceRepository,
    },
    {
      provide : IPaymentRepository,
      useClass :PaymentRepository
    }
  ],
  exports: [
    IClientRepository,
    IBuildingRepository,
    ILocationRepository,
    IInvoiceRepository,
    IPaymentRepository
  ],
})
export class RepositoriesModule {}
