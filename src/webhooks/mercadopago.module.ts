import { Module } from '@nestjs/common';
import { MercadoPagoWebhookController } from './mercadopago.controller';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [MercadoPagoWebhookController],
})
export class MercadoPagoModule {}
