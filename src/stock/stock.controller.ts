import { Controller, Post, Body, Patch, Param, Delete, UseGuards, Get } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard, RequirePermission } from '../permissions/permissions.guard';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('stock:view')
  findAll() {
    return this.stockService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('stock:manage')
  create(@Body() dto: CreateStockDto) {
    return this.stockService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('stock:manage')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStockDto,
  ) {
    return this.stockService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('stock:manage')
  remove(@Param('id') id: string) {
    return this.stockService.remove(id);
  }
}
