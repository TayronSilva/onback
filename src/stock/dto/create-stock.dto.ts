import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateStockDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsInt()
  @Min(0)
  quantity: number;
}
