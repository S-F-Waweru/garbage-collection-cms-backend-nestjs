import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePettyCashDto {
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
