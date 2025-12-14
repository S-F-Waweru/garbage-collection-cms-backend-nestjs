// presentation/invoice.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GenerateInvoiceUseCase } from '../application/use-cases/generate-invoice.use-case';
import { GetInvoiceUseCase } from '../application/use-cases/get-invoice.use-case';
import { ListInvoicesUseCase } from '../application/use-cases/list-invoices.use-case';
import { UpdateInvoiceStatusUseCase } from '../application/use-cases/update-invoice-status.use-case';
import { GenerateInvoiceDto } from '../application/dto/generate-invoice.dto';
import { UpdateInvoiceStatusDto } from '../application/dto/update-invoice-status.dto';
import { ListInvoicesDto } from '../application/dto/list-invoices.dto';
import { InvoiceResponseDto } from '../application/dto/invoice-response.dto';

@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
// @UseGuards(AuthGuard) // Add your auth guard
export class InvoiceController {
  constructor(
    private readonly generateInvoiceUseCase: GenerateInvoiceUseCase,
    private readonly getInvoiceUseCase: GetInvoiceUseCase,
    private readonly listInvoicesUseCase: ListInvoicesUseCase,
    private readonly updateInvoiceStatusUseCase: UpdateInvoiceStatusUseCase,
  ) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate invoice for a client' })
  @ApiResponse({ status: 201, type: InvoiceResponseDto })
  async generate(@Body() dto: GenerateInvoiceDto, @Req() req: any) {
    const userId = req.user?.id || 'SYSTEM';
    const invoice = await this.generateInvoiceUseCase.execute(dto, userId);
    return InvoiceResponseDto.fromDomain(invoice);
  }

  @Get()
  @ApiOperation({ summary: 'List all invoices with filters' })
  @ApiResponse({ status: 200, type: [InvoiceResponseDto] })
  async list(@Query() query: ListInvoicesDto) {
    const filters = {
      clientId: query.clientId,
      status: query.status,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    };

    const invoices = await this.listInvoicesUseCase.execute(filters);
    return invoices.map(InvoiceResponseDto.fromDomain);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, type: InvoiceResponseDto })
  async getById(@Param('id') id: string) {
    const invoice = await this.getInvoiceUseCase.execute(id);
    return InvoiceResponseDto.fromDomain(invoice);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Get all invoices for a client' })
  @ApiResponse({ status: 200, type: [InvoiceResponseDto] })
  async getByClient(@Param('clientId') clientId: string) {
    const invoices = await this.listInvoicesUseCase.execute({ clientId });
    return invoices.map(InvoiceResponseDto.fromDomain);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  @ApiResponse({ status: 200, type: InvoiceResponseDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceStatusDto,
  ) {
    const invoice = await this.updateInvoiceStatusUseCase.execute(
      id,
      dto.status,
    );
    return InvoiceResponseDto.fromDomain(invoice);
  }
}
