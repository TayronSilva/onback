import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('webhooks/mercadopago')
export class PaymentWebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async handle(@Body() payload: any) {
    if (payload.type !== 'payment') {
      return { received: true };
    }

    const paymentId = payload.data?.id;

    if (!paymentId) {
      return { received: true };
    }

    await this.paymentService.markOrderAsPaid(
      paymentId.toString(),
    );

    return { received: true };
  }
}
