// application/use-cases/list-invoices.use-case.ts
import { Injectable, Inject } from '@nestjs/common';

import { Invoice } from '../../domain/invoice.entity';
import { IInvoiceRepository } from '../../domain/invoice.repository.intreface';
import {
  PaginatedResult,
  PaginationParams,
} from '../../../clients/client/application/use-cases/find-all-pagiantion.use-case';
import { Client } from '../../../clients/client/domain/entities/client.entity';

@Injectable()
export class GetAllInvoicesPaginatedUseCase {
  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
  ) {}

  async execute(params: PaginationParams): Promise<PaginatedResult<Invoice>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [invoices, total] = await this.invoiceRepo.findAllPaginated(
      skip,
      limit,
    );

    return {
      data: invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
