import {
  BadRequestException,
  Inject,
  Injectable, Logger,
  NotFoundException,
} from '@nestjs/common';
import { IInvoiceRepository } from '../../../invoices/domain/invoice.repository.intreface';
import { IClientRepository } from '../../../clients/client/domain/interface/client.repository.interface';
import { IEmailSenderService } from '../services/iemail-sender/iemail-sender.service';
import { DownloadInvoicePdfUseCase } from '../../../invoices/application/usecase/download-invoice-pdf.use-case';
import { Email } from '../../domain/value-objects/email.vo';
import { InvoiceStatus } from '../../../invoices/application/models';

@Injectable()
export class SendInvoiceEmailUseCase {
  constructor(
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
    @Inject(IClientRepository)
    private readonly clientRepo: IClientRepository,
    @Inject(IEmailSenderService)
    private readonly emailService: IEmailSenderService,
    private readonly downloadPdfUseCase: DownloadInvoicePdfUseCase,
  ) {}

  logger = new Logger(SendInvoiceEmailUseCase.name)
  async execute(invoiceId: string): Promise<void> {
    const invoice = await this.invoiceRepo.findById(invoiceId);
    if (!invoice) throw new NotFoundException('Invoice  Not found');

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Invoice  Not found');
    }

    if(invoice.isMailSent === true){
      throw new BadRequestException('Email has Already been sent')
    }

    const client = await this.clientRepo.findById(invoice.clientId);
    if (!client || !client.email)
      throw new NotFoundException('Client or client email Not Found');

    const pdfBuffer = await this.downloadPdfUseCase.execute(invoiceId);

    const clientEmail = new Email(client.email);
    try {
      await this.emailService.sendInvoiceEmail(
          clientEmail,
          pdfBuffer,
          invoice.invoiceNumber,
      );
      invoice.setIsMailSent(true)
      this.logger.debug(`After the Save  ====================================`)
      this.logger.debug(invoice)
      const savedInvoice =await this.invoiceRepo.save(invoice);
      this.logger.debug(`After the Save  ====================================`)
       this.logger.debug(savedInvoice)


    }catch (error){
      this.logger.error(error);
      throw  new BadRequestException(`sending email failed`)
    }



  }
}
