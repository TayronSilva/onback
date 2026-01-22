import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'database/prisma/prisma.service';
import { Prisma, OrderStatus } from '@prisma/client';
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class OrderService {
  private readonly ORIGIN_ZIP_CODE = '26584-260'; 

  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService,
  ) {}

  async create(userId: number, dto: {
    items: { stockId: string; quantity: number }[];
  }) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order must have at least one item');
    }

    const userWithAddress = await this.prisma.client.user.findUnique({
      where: { id: userId },
      include: {
        address: {
          where: { isDefault: true }
        }
      }
    });

    const defaultAddress = userWithAddress?.address[0];
    if (!defaultAddress) {
      throw new BadRequestException('Usuário não possui um endereço padrão cadastrado.');
    }

    const order = await this.prisma.client.$transaction(async (tx) => {
      let subtotal = 0;
      let totalWeight = 0;
      let totalVolume = 0; 
      
      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];

      for (const item of dto.items) {
        const stock = await tx.stock.findUnique({
          where: { id: item.stockId },
          include: { product: true },
        });

        if (!stock || stock.quantity < item.quantity) {
          throw new BadRequestException(`Estoque insuficiente: ${stock?.product.name || 'Item'}`);
        }

        await tx.stock.update({
          where: { id: stock.id },
          data: { quantity: { decrement: item.quantity } },
        });

        const itemTotal = Number(stock.product.price) * item.quantity;
        subtotal += itemTotal;

        totalWeight += (stock.product.weight || 0) * item.quantity;
        totalVolume += ((stock.product.height || 1) * (stock.product.width || 1) * (stock.product.length || 1)) * item.quantity;

        orderItems.push({
          productId: stock.product.id,
          productName: stock.product.name,
          productPrice: stock.product.price,
          stockId: stock.id,
          size: stock.size,
          color: stock.color,
          quantity: item.quantity,
        });
      }

      const freight = this.calculateInternalFreight(
        this.ORIGIN_ZIP_CODE,
        defaultAddress.zipCode,
        totalWeight,
        totalVolume
      );

      const subtotalPlusFreight = subtotal + freight;
      const discount = subtotalPlusFreight * 0.10; 
      const totalWithDiscount = subtotalPlusFreight - discount;

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      return tx.order.create({
        data: {
          userId: Number(userId),
          status: OrderStatus.PENDING,
          subtotal: new Prisma.Decimal(subtotal),
          freight: new Prisma.Decimal(freight),
          total: new Prisma.Decimal(totalWithDiscount),
          expiresAt,
          items: { create: orderItems },
        },
        include: { user: true },
      });
    });

    try {
      const paymentData = await this.paymentService.createPixPayment({
        id: order.id,
        total: order.total.toNumber(), 
        user: { 
          email: order.user.email,
          name: order.user.name ?? 'Cliente OnBack',
          cpf: (order.user.cpf ?? '').replace(/\D/g, '') 
        },
      });

      return {
        message: 'Pedido criado com sucesso (Desconto de 10% aplicado para PIX)',
        order,
        payment: paymentData,
      };
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      return {
        message: 'Pedido criado, mas falhou ao gerar PIX',
        order,
        payment: null,
      };
    }
  }

  private calculateInternalFreight(origin: string, destination: string, weight: number, volume: number): number {
    const originPrefix = origin.substring(0, 2);
    const destPrefix = destination.substring(0, 2);

    let baseRate = 12.00;

    if (originPrefix === destPrefix) {
      baseRate = 8.00;
    } else {
      baseRate = 20.00;
    }

    const weightCost = (weight / 1000) * 0.50; 
    
    const volumeCost = (volume / 1000) * 0.01;

    return Number((baseRate + weightCost + volumeCost).toFixed(2));
  }

  async cancel(orderId: string) {
    return this.prisma.client.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new NotFoundException('Order not found');
      if (order.status === OrderStatus.PAID) throw new BadRequestException('Não pode cancelar pedido pago');

      for (const item of order.items) {
        if (item.stockId) {
          await tx.stock.update({
            where: { id: item.stockId },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELED },
      });
    });
  }
}