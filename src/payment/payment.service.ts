import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig, { Payment } from 'mercadopago';
import { PrismaService } from 'database/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  private payment: Payment;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const client = new MercadoPagoConfig({
      accessToken: this.config.get<string>('MERCADO_PAGO_ACCESS_TOKEN')!,
    });
    this.payment = new Payment(client);
  }

  async createPixPayment(order: {
    id: string;
    total: number;
    user: { email: string; name: string; cpf: string };
  }) {
    const nameParts = order.user.name.trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'OnBack';

    const response = await this.payment.create({
      body: {
        transaction_amount: order.total,
        description: `Pedido ${order.id}`,
        payment_method_id: 'pix',
        payer: {
          email: order.user.email,
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: 'CPF',
            number: order.user.cpf,
          },
        },
        external_reference: order.id,
      },
    });

    const transactionData = response.point_of_interaction?.transaction_data;

    if (!transactionData) {
      throw new Error('PIX data not returned');
    }

    return {
      paymentId: response.id?.toString(),
      qrCode: transactionData.qr_code,
      qrCodeBase64: transactionData.qr_code_base64,
    };
  }

  async createCardPayment(order: {
    id: string;
    total: number;
    user: { email: string; name: string; cpf: string };
    token: string;
    installments?: number;
    paymentMethodId?: string;
  }) {
    const nameParts = order.user.name.trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'OnBack';

    const response = await this.payment.create({
      body: {
        transaction_amount: order.total,
        description: `Pedido ${order.id}`,
        payment_method_id: order.paymentMethodId || 'credit_card',
        token: order.token,
        installments: order.installments || 1,
        payer: {
          email: order.user.email,
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: 'CPF',
            number: order.user.cpf,
          },
        },
        external_reference: order.id,
      },
    });

    if (response.status === 'approved') {
      await this.markOrderAsPaid(response.id?.toString() || '');
    }

    return {
      paymentId: response.id?.toString(),
      status: response.status,
      statusDetail: response.status_detail,
      transactionAmount: response.transaction_amount,
    };
  }

  async getOrderData(orderId: string) {
    const order = await this.prisma.client.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            cpf: true,
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    return {
      id: order.id,
      total: Number(order.total),
      user: order.user,
    };
  }

  async markOrderAsPaid(paymentId: string) {
    let payment;
    try {
      payment = await this.payment.get({ id: paymentId });
    } catch (err) {
      return;
    }

    const orderId = payment.external_reference;
    if (!orderId) return;

    const order = await this.prisma.client.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.status === OrderStatus.PAID) return;

    if (payment.status === 'approved') {
      await this.prisma.client.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAID,
          paymentId: payment.id?.toString(),
          paymentType: payment.payment_method_id,
          paidAt: new Date(),
        },
      });
    }
  }
}
