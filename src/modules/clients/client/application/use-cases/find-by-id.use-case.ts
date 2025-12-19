import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IClientRepository } from '../../domain/interface/client.repository.interface';
import { Client } from '../../domain/entities/client.entity';
import { IBuildingRepository } from 'src/modules/clients/building/domain/interface/buidling.repsository.interface';
import { IInvoiceRepository } from 'src/modules/invoices/domain/invoice.repository.intreface';
import { IPaymentRepository } from 'src/modules/payments/domain/payment.repositiory.interface';

@Injectable()
export class FindClientByIdUseCase {
  constructor(
    @Inject(IClientRepository)
    private readonly clientRepository: IClientRepository,
    @Inject(IBuildingRepository)
    private readonly buildingRepository: IBuildingRepository,
    @Inject(IInvoiceRepository)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(IPaymentRepository) readonly paymentResposioty: IPaymentRepository,
  ) {}

  async execute(id: string) {
    const [client, buildings, invoices, payments] = await Promise.all([
      this.clientRepository.findById(id),
      this.buildingRepository.findClientBuildings(id),
      this.invoiceRepository.findByClient(id),
      this.paymentResposioty.findByClient(id),
    ]);

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    // Return a new object that merges the client with cleaned buildings
    return {
      ...client,
      _buildings: buildings.map((building) => {
        // 1. Extract _client from the building
        const { _client, ...buildingData } = building as any;

        // 2. If _client exists, remove its internal _buildings array
        // and return the building with a "lean" client or no client at all
        if (_client) {
          const { _buildings, ...leanClient } = _client;
          // Option A: If you still want the client basic info inside the building:
          // return { ...buildingData, _client: leanClient };

          // Option B: Total removal (recommended for your case):
          return buildingData;
        }

        return buildingData;
      }),
      _invoices: invoices,
      _payments: payments,
    };
  }
}
