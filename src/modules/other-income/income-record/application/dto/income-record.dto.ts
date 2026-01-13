import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export enum Unit {
  KG = 'KG',
  LITER = 'LITER',
  PIECE = 'PIECE',
}

// DTO for creating a new income record
export class CreateIncomeRecordDto {
  @IsUUID()
  categoryId: string;

  @IsString()
  clientName: string;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsInt()
  @Min(1)
  unitCount: number;

  @IsEnum(Unit)
  unitType: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // Optional: set programmatically from logged-in user
  // @IsOptional()
  // @IsUUID()
  // recordedBy?: string;
}

// DTO for updating an existing income record
export class UpdateIncomeRecordDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  unitCount?: number;

  @IsOptional()
  @IsString()
  unitType?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
