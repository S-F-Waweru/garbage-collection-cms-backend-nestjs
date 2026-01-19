// presentation/invoice.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UseRoles } from 'nest-access-control';
import * as express from 'express';

import {
  GenerateInvoiceDto,
  InvoiceResponseDto,
  ListInvoicesDto,
  UpdateInvoiceStatusDto,
} from '../application/dto/invoice.dto';
import { GenerateInvoiceUseCase } from '../application/usecase/generate-invoice.usecase';
import { GetInvoiceUseCase } from '../application/usecase/get-invoice.use-case';
import { ListInvoicesUseCase } from '../application/usecase/list-invoices.use-case';
import { UpdateInvoiceStatusUseCase } from '../application/usecase/update-invoice-status.use-case';
import { User } from '../../auth/domain/entities/user.entity';
import { GetAllInvoicesPaginatedUseCase } from '../application/usecase/get-all-invoices-paginate';
import { DownloadInvoicePdfUseCase } from '../application/usecase/download-invoice-pdf.use-case';
import { BulkDownloadInvoicesUseCase } from '../application/usecase/bulk-download-invoices.use-case';
import { SendInvoiceEmailUseCase } from '../../auth/application/use-cases/SendInvoiceEmailUseCase.usecase';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { InvoiceCronService } from '../application/services/invoice-cron/invoice-cron.service';

interface RequestWithUser extends Request {
  user?: User;
}

@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoiceController {
  constructor(
      private readonly generateInvoiceUseCase: GenerateInvoiceUseCase,
      private readonly getInvoiceUseCase: GetInvoiceUseCase,
      private readonly listInvoicesUseCase: ListInvoicesUseCase,
      private readonly updateInvoiceStatusUseCase: UpdateInvoiceStatusUseCase,
      private readonly listPaginatedUsecase: GetAllInvoicesPaginatedUseCase,
      private readonly downloadPdfUseCase: DownloadInvoicePdfUseCase,
      private readonly bulkDownloadUseCase: BulkDownloadInvoicesUseCase,
      private readonly sendInvoiceEmailUseCase: SendInvoiceEmailUseCase,
      private readonly invoiceCronService: InvoiceCronService,
  ) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @UseRoles({
    resource: 'invoices',
    action: 'create',
    possession: 'any',
  })
  @ApiOperation({ summary: 'Generate invoice for a client' })
  @ApiResponse({ status: 201, type: InvoiceResponseDto })
  async generate(@Body() dto: GenerateInvoiceDto, @Req() req: RequestWithUser) {
    const userId = req.user?.id || 'SYSTEM';
    return await this.generateInvoiceUseCase.execute(dto, userId);
  }

  @Get('')
  @UseRoles({
    resource: 'invoices',
    action: 'read',
    possession: 'any',
  })
  @ApiOperation({ summary: 'List all invoices with filters' })
  @ApiResponse({ status: 200, type: [InvoiceResponseDto] })
  async list(@Query() query: ListInvoicesDto) {
    const filters = {
      clientId: query.clientId,
      status: query.status,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    };
    return await this.listInvoicesUseCase.execute(filters);
  }

  @Get('paginated')
  @UseRoles({
    resource: 'invoices',
    action: 'read',
    possession: 'any',
  })
  @ApiOperation({ summary: 'List all invoices with pagination' })
  @ApiResponse({ status: 200 })
  async listAllPaginated(
      @Query('page') page: string = '1',
      @Query('limit') limit: string = '10',
  ) {
    return await this.listPaginatedUsecase.execute({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  @Get(':id/download')
  @UseRoles({
    resource: 'invoices',
    action: 'read',
    possession: 'any',
  })
  @ApiOperation({ summary: 'Download single invoice as PDF' })
  async downloadPdf(
      @Param('id') id: string,
      @Res() res: express.Response,
  ) {
    const buffer = await this.downloadPdfUseCase.execute(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Post('invoices/:id/fix')
  @UseRoles({
    resource: 'invoices',
    action: 'update',
    possession: 'any',
  })
  fixInvoice(@Param('id') id: string, @CurrentUser() user: any) {
    const userId = user.userId as string;
    return this.invoiceCronService.fixWrongInvoice(id, userId);
  }

  @Post(':id/send-email')
  @UseRoles({
    resource: 'invoices',
    action: 'update',
    possession: 'any',
  })
  async sendInvoiceEmail(@Param('id') id: string) {
    await this.sendInvoiceEmailUseCase.execute(id);
    return { message: 'Invoice email sent successfully' };
  }

  @Post('bulk-download')
  @HttpCode(HttpStatus.OK)
  @UseRoles({
    resource: 'invoices',
    action: 'read',
    possession: 'any',
  })
  @ApiOperation({ summary: 'Download multiple invoices as ZIP' })
  async bulkDownload(
      @Body('ids') ids: string[],
      @Res() res: express.Response,
  ) {
    const zipStream = await this.bulkDownloadUseCase.execute(ids);

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="Invoices_Batch_${Date.now()}.zip"`,
    });

    zipStream.pipe(res);

    zipStream.on('error', (err) => {
      if (!res.headersSent) {
        res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send({ message: 'ZIP generation failed' });
      }
    });
  }

  @Get(':id')
  @UseRoles({
    resource: 'invoices',
    action: 'read',
    possession: 'any',
  })
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, type: InvoiceResponseDto })
  async getById(@Param('id') id: string) {
    return await this.getInvoiceUseCase.execute(id);
  }

  @Patch(':id/status')
  @UseRoles({
    resource: 'invoices',
    action: 'update',
    possession: 'any',
  })
  @ApiOperation({ summary: 'Update invoice status' })
  @ApiResponse({ status: 200, type: InvoiceResponseDto })
  async updateStatus(
      @Param('id') id: string,
      @Body() dto: UpdateInvoiceStatusDto,
  ) {
    return await this.updateInvoiceStatusUseCase.execute(id, dto.status);
  }
}