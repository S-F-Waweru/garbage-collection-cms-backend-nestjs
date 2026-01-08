// application/dto/generate-invoice.dto.ts
import {
  IsUUID,
  IsDate,
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '../models';

export class GenerateInvoiceDto {
  @ApiProperty({
    description: 'Client ID to generate invoice for',
  })
  @IsUUID()
  clientId: string;

  @ApiProperty({
    description: 'Start date of the billing period',
  })
  @IsDate()
  @Type(() => Date)
  billingPeriodStart: Date;

  @ApiProperty({
    description: 'End date of the billing period',
  })
  @IsDate()
  @Type(() => Date)
  billingPeriodEnd: Date;

  @ApiPropertyOptional({
    description: 'Specific invoice date (defaults to current date)',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  invoiceDate?: Date;

  @ApiPropertyOptional({
    description: 'Notes to include on the invoice',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Whether to validate only without creating invoice',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  validateOnly?: boolean;
}

export class UpdateInvoiceStatusDto {
  @ApiProperty({ enum: InvoiceStatus })
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}

export class ListInvoicesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  toDate?: string;
}

export class InvoiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  invoiceNumber: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  billingPeriodStart: Date;

  @ApiProperty()
  billingPeriodEnd: Date;

  @ApiProperty()
  invoiceDate: Date;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  unitCount: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  creditApplied: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  amountPaid: number;

  @ApiProperty()
  balance: number;

  @ApiProperty({ enum: InvoiceStatus })
  status: InvoiceStatus;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromDomain(invoice: any): InvoiceResponseDto {
    return invoice.toObject();
  }
}
