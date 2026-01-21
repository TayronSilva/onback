import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateStockDto {
  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;
}
