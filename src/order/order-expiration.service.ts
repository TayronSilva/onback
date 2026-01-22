import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'database/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderExpirationService {
  constructor(private prisma: PrismaService) {}

  @Cron('*/1 * * * *')
  async cancelExpiredOrders() {
    const now = new Date();

    const expiredOrders = await this.prisma.client.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        expiresAt: {
          lt: now,
        },
      },
      include: {
        items: true,
      },
    });

    for (const order of expiredOrders) {
      await this.prisma.client.$transaction(async tx => {
        for (const item of order.items) {
          if (!item.stockId) continue;

          await tx.stock.update({
            where: { id: item.stockId },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CANCELED,
          },
        });
      });
    }
  }
}
