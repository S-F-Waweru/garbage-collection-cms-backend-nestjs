import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsString()
  pettyCashId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsDate()
  expenseDate: Date;

  @IsNotEmpty()
  @IsString()
  recordedBy: string;
}

export class UpdateExpenseDto {
  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsString()
  pettyCashId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsDate()
  expenseDate: Date;

  @IsNotEmpty()
  @IsString()
  recordedBy: string;
}
