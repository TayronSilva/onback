import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MercadoPagoWebhookController } from 'src/webhooks/mercadopago.controller';

@Module({
  providers: [PaymentService],
  controllers: [MercadoPagoWebhookController],
  exports: [PaymentService],
})
export class PaymentModule {}