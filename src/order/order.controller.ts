import { Controller, Post, Body, Patch, Param, UseGuards, Req, Get } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionsGuard, RequirePermission } from '../permissions/permissions.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('order:manage', 'cart:manage')
  @Post()
  async create(@Body() dto: any, @Req() req: any) {
    const userId = req.user.sub || req.user.id; 
    return this.service.create(userId, dto);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('order:view')
  @Get('me')
  async getMyOrders(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.service.findByUser(userId);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('order:view')
  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('order:view')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('order:manage')
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }
}
