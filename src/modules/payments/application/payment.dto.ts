// application/dto/record-payment.dto.ts
import {
  IsUUID,
  IsNumber,
  IsEnum,
  IsDate,
  IsOptional,
  IsString,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../domain/payment.entity';

export class RecordPaymentDto {
  @ApiProperty({
    description: 'Client UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  clientId: string;

  @ApiProperty({
    description: 'Payment amount in KES',
    example: 50000,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiProperty({
    enum: PaymentMethod,
    description: 'Payment method used',
    example: PaymentMethod.MPESA,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Date when payment was made',
    example: '2024-12-14',
  })
  @IsDate()
  @Type(() => Date)
  paymentDate: Date;

  @ApiPropertyOptional({
    description: 'Reference number (e.g., Mpesa code, bank transaction ID)',
    example: 'QH12345678',
  })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the payment',
    example: 'Partial payment for December invoice',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ListPaymentsDto {
  @ApiPropertyOptional({
    description: 'Filter by client UUID',
  })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    description: 'Filter by payment method',
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Filter from date (ISO format)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter to date (ISO format)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class PaymentApplicationDto {
  @ApiProperty({ description: 'Invoice UUID' })
  invoiceId: string;

  @ApiProperty({ description: 'Invoice number', example: 'INV-2024-0001' })
  invoiceNumber: string;

  @ApiProperty({ description: 'Amount applied to this invoice' })
  amountApplied: number;
}

export class PaymentResponseDto {
  @ApiProperty({ description: 'Payment UUID' })
  id: string;

  @ApiProperty({
    description: 'Sequential payment number',
    example: 'PAY-2024-0001',
  })
  paymentNumber: string;

  @ApiProperty({ description: 'Client UUID' })
  clientId: string;

  @ApiProperty({ description: 'Payment amount' })
  amount: number;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Payment date' })
  paymentDate: Date;

  @ApiPropertyOptional({ description: 'Reference number' })
  referenceNumber?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  notes?: string;

  @ApiProperty({ description: 'User who created the payment' })
  createdBy: string;

  @ApiProperty({
    type: [PaymentApplicationDto],
    description: 'Invoices this payment was applied to',
  })
  appliedToInvoices: PaymentApplicationDto[];

  @ApiProperty({ description: 'Excess amount moved to client credit' })
  excessAmount: number;

  @ApiProperty({ description: 'Total amount applied to invoices' })
  totalApplied: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  static fromDomain(payment: any): PaymentResponseDto {
    return payment.toObject();
  }
}
