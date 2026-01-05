import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
export enum IncomeSource {
  CASH = 'CASH',
  MPESA = 'MPESA',
  BANK = 'BANK',
}

export class CreatePettyCashDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(IncomeSource)
  incomeSource: IncomeSource;

  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @IsString()
  @IsOptional()
  notes: string;
}

export class UpdatePettyCashDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @IsString()
  @IsOptional()
  notes: string;
}
