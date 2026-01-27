import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PaymentModule } from '../payment/payment.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PaymentModule, PermissionsModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}