// presentation/payment.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import {
  PaymentResponseDto,
  RecordPaymentDto,
  ListPaymentsDto,
} from '../application/payment.dto';
import { GetPaymentUseCase } from '../application/usecases/get-payment.use-case';
import { ListPaymentsUseCase } from '../application/usecases/list-payments.use-case';
import { RecordPaymentUseCase } from '../application/usecases/record-payment.use-case';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly recordPaymentUseCase: RecordPaymentUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase,
    private readonly listPaymentsUseCase: ListPaymentsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Record a new payment',
    description:
      'Records payment and automatically applies it to oldest outstanding invoices (FIFO). Excess amount is stored as client credit.',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment recorded successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid payment data or client not found',
  })
  async recordPayment(@Body() dto: RecordPaymentDto, @Req() req: any) {
    const userId = req.user?.id || 'SYSTEM';
    const payment = await this.recordPaymentUseCase.execute(dto, userId);
    return PaymentResponseDto.fromDomain(payment);
  }

  @Get()
  @ApiOperation({
    summary: 'List all payments with optional filters',
    description:
      'Returns all payments with support for filtering by client, method, and date range',
  })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved successfully',
    type: [PaymentResponseDto],
  })
  async listPayments(@Query() query: ListPaymentsDto) {
    const filters = {
      clientId: query.clientId,
      paymentMethod: query.paymentMethod,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    const payments = await this.listPaymentsUseCase.execute(filters);
    return payments.map(PaymentResponseDto.fromDomain);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get payment by ID',
    description:
      'Returns detailed payment information including invoice applications',
  })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Payment found',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async getById(@Param('id') id: string) {
    const payment = await this.getPaymentUseCase.execute(id);
    return PaymentResponseDto.fromDomain(payment);
  }

  @Get('client/:clientId')
  @ApiOperation({
    summary: 'Get all payments for a specific client',
    description:
      'Returns payment history for a client, ordered by payment date (newest first)',
  })
  @ApiParam({ name: 'clientId', description: 'Client UUID' })
  @ApiResponse({
    status: 200,
    description: 'Client payments retrieved successfully',
    type: [PaymentResponseDto],
  })
  async getByClient(@Param('clientId') clientId: string) {
    const payments = await this.listPaymentsUseCase.execute({ clientId });
    return payments.map(PaymentResponseDto.fromDomain);
  }
}
