// use-cases/generate-invoice.usecase.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { Invoice, InvoiceStatus } from '../../domain/invoice.entity';
import { Client } from 'pg';
import { ClientCredit } from 'src/modules/client-credit/domain/client-credit.entity';
import { Building } from 'src/modules/clients/building/domain/building.entity';
import { GenerateInvoiceDto } from '../dto/invoice.dto';

@Injectable()
export class GenerateInvoiceUseCase {
  // todo Generate Invoice implemetation.
}
