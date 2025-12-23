// presentation/payment.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ListPaymentsDto,
  PaymentResponseDto,
  RecordPaymentDto,
} from '../application/payment.dto';
import { GetPaymentUseCase } from '../application/usecases/get-payment.use-case';
import { ListPaymentsUseCase } from '../application/usecases/list-payments.use-case';
import { RecordPaymentUseCase } from '../application/usecases/record-payment.use-case';
import { ListPaginatedPaymentsUseCase } from '../application/usecases/get-paginated-payments';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { CurrentUserDto } from '../../expences/petty-cash/presentation/petty-cash.controller';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

export interface RequestwithUser extends Request {
  user?: any;
}

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly recordPaymentUseCase: RecordPaymentUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase,
    private readonly listPaymentsUseCase: ListPaymentsUseCase,
    private readonly listPaginatedUsecase: ListPaginatedPaymentsUseCase,
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
  async recordPayment(
    @Body() dto: RecordPaymentDto,
    @CurrentUser() user: CurrentUserDto,
  ) {
    const userId = user.userId;
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
    return await this.listPaymentsUseCase.execute({ clientId });
  }

  @Get('all-paginated')
  @ApiOperation({ summary: 'List all payments with pagination' })
  @ApiResponse({ status: 200, type: [PaymentResponseDto] })
  async listAllPaginated(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return await this.listPaginatedUsecase.execute({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }
}
