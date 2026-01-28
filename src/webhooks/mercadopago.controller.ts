import { Controller, Post, Headers, Req, BadRequestException, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import type { Request } from 'express';
import * as crypto from 'crypto';
import { PaymentService } from 'src/payment/payment.service';

@Controller('webhooks/mercadopago')
export class MercadoPagoWebhookController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post()
  @HttpCode(HttpStatus.OK)
  async handle(
    @Req() req: Request,
    @Headers('x-signature') signature?: string,
  ) {
    const body = req.body;
    Logger.log('[WEBHOOK] Notificação recebida: ' + JSON.stringify(body), 'MercadoPago');

    if (signature && process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
      this.validateSignature(req, signature);
    }

    const type = body.type || body.action;

    if (type !== 'payment' && type !== 'payment.created' && type !== 'payment.updated') {
      return { received: true };
    }

    const paymentId = body.data?.id || body.id;

    if (!paymentId) {
      throw new BadRequestException('Payment id missing');
    }

    await this.paymentService.markOrderAsPaid(paymentId.toString());

    return { received: true };
  }

  private validateSignature(req: Request, signature: string) {
    try {
      const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
      const rawBody = (req as any).rawBody;
      if (!secret || !rawBody) return;

      const parts = signature.split(',');
      const ts = parts.find(p => p.includes('ts='))?.split('=')[1];
      const hash = parts.find(p => p.includes('v1='))?.split('=')[1];

      const manifest = `id:${req.body.data?.id};request-id:${req.headers['x-request-id']};ts:${ts};`;
      const expectedHash = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

      if (expectedHash !== hash) throw new BadRequestException('Invalid signature');
    } catch (e) {
      Logger.error('[WEBHOOK SIG ERROR] ' + e.message, 'MercadoPago');
    }
  }
}
