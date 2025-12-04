import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';

/**
 * DTO for creating a new income category
 */
export class CreateIncomeCategoryDto {
  @IsNotEmpty({ message: 'Income category name cannot be empty' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO for updating an existing income category
 */
export class UpdateIncomeCategoryDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO for listing income categories with optional filtering/pagination
 */
export class ListIncomeCategoriesDto {
  @IsOptional()
  @IsString()
  search?: string; // optional search term for name

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
