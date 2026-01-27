import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MercadoPagoWebhookController } from 'src/webhooks/mercadopago.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  providers: [PaymentService],
  controllers: [PaymentController, MercadoPagoWebhookController],
  exports: [PaymentService],
})
export class PaymentModule {}