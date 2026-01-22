import { Controller, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/auth/auth.guard'; 

@Controller('orders')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() dto: any, @Req() req: any) {
    const userId = req.user.sub || req.user.id; 
    return this.service.create(userId, dto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }
}
