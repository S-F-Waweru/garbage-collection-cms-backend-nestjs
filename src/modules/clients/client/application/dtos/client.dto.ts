import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
  IsArray,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../building/domain/building.entity';
import {
  CreateBuildingDto,
  CreateClientBuildingDto,
} from '../../../building/application/dto/building.dto';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsNotEmpty()
  @IsString()
  KRAPin: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  billingDate: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?:\+254|0)[17]\d{8}$/, {
    message: 'Phone must be a valid Kenyan phone number',
  })
  phone: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClientBuildingDto)
  buildings?: CreateClientBuildingDto[];
}

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  KRAPin?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(?:\+254|0)[17]\d{8}$/, {
    message: 'Phone must be a valid Kenyan phone number',
  })
  phone?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsNotEmpty()
  @IsString()
  billingDate: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBuildingDto)
  buildings?: CreateBuildingDto[];
}
