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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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

interface RequestWithUser extends Request {
  user?: User; // Replace User with your actual user type
}

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
  async generate(@Body() dto: GenerateInvoiceDto, @Req() req: RequestWithUser) {
    const userId = req.user?.id || 'SYSTEM';
    return await this.generateInvoiceUseCase.execute(dto, userId);
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
    return await this.listInvoicesUseCase.execute(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, type: InvoiceResponseDto })
  async getById(@Param('id') id: string) {
    return await this.getInvoiceUseCase.execute(id);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Get all invoices for a client' })
  @ApiResponse({ status: 200, type: [InvoiceResponseDto] })
  async getByClient(@Param('clientId') clientId: string) {
    return await this.listInvoicesUseCase.execute({ clientId });
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
