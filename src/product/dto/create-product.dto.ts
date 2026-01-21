import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min, IsArray, ValidateNested } from 'class-validator';
import { CreateStockDto } from 'src/stock/dto/create-stock.dto';

export class CreateProductDto {

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStockDto)
  stocks: CreateStockDto[];
}
