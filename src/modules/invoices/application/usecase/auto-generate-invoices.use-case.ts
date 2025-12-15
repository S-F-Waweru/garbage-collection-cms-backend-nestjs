// application/use-cases/auto-generate-invoices.use-case.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { IClientRepository } from 'src/modules/clients/client/domain/interface/client.repository.interface';
import { GenerateInvoiceDto } from '../dto/invoice.dto';
import { GenerateInvoiceUseCase } from './generate-invoice.usecase';

@Injectable()
export class AutoGenerateInvoicesUseCase {
  private readonly logger = new Logger(AutoGenerateInvoicesUseCase.name);

  // todo finish the auto generate inovices
}
