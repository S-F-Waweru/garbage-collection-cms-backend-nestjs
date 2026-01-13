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
import * as express from 'express'; // Required to fix TS1272 metadata errors

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
  ) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate invoice for a client' })
  @ApiResponse({ status: 201, type: InvoiceResponseDto })
  async generate(@Body() dto: GenerateInvoiceDto, @Req() req: RequestWithUser) {
    const userId = req.user?.id || 'SYSTEM';
    return await this.generateInvoiceUseCase.execute(dto, userId);
  }

  // FIXED: Renamed route to avoid collision with listAllPaginated
  @Get('')
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

  // FIXED: Renamed route to avoid collision with list
  @Get('paginated')
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
  @ApiOperation({ summary: 'Download single invoice as PDF' })
  async downloadPdf(
    @Param('id') id: string,
    @Res() res: express.Response, // Explicitly using express namespace
  ) {
    const buffer = await this.downloadPdfUseCase.execute(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
      'Content-Length': buffer.length,
    });

    // Send the buffer directly
    res.send(buffer);
  }

  @Post(':id/send-email')
  async sendInvoiceEmail(@Param('id') id: string) {
    await this.sendInvoiceEmailUseCase.execute(id);
    return { message: 'Invoice email sent successfully' };
  }

  @Post('bulk-download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Download multiple invoices as ZIP' })
  async bulkDownload(
    @Body('ids') ids: string[],
    @Res() res: express.Response, // Explicitly using express namespace
  ) {
    const zipStream = await this.bulkDownloadUseCase.execute(ids);

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="Invoices_Batch_${Date.now()}.zip"`,
    });

    // Pipe the archive stream to the response
    zipStream.pipe(res);

    zipStream.on('error', (err) => {
      // Avoid calling res.status if headers are already sent
      if (!res.headersSent) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send({ message: 'ZIP generation failed' });
      }
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, type: InvoiceResponseDto })
  async getById(@Param('id') id: string) {
    return await this.getInvoiceUseCase.execute(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  @ApiResponse({ status: 200, type: InvoiceResponseDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceStatusDto,
  ) {
    return await this.updateInvoiceStatusUseCase.execute(id, dto.status);
  }
}
