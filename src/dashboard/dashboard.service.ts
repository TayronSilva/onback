import { Injectable } from '@nestjs/common';
import { PrismaService } from 'database/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStatistics() {
    const totalCustomers = await this.prisma.client.order.groupBy({
      by: ['userId'],
      where: {
        status: OrderStatus.PAID,
      },
    });

    const totalOrdersPaid = await this.prisma.client.order.count({
      where: {
        status: OrderStatus.PAID,
      },
    });

    const totalOrdersPending = await this.prisma.client.order.count({
      where: {
        status: OrderStatus.PENDING,
      },
    });

    const totalOrdersCanceled = await this.prisma.client.order.count({
      where: {
        status: OrderStatus.CANCELED,
      },
    });

    const salesResult = await this.prisma.client.order.aggregate({
      where: {
        status: OrderStatus.PAID,
      },
      _sum: {
        total: true,
      },
    });

    const totalSales = salesResult._sum.total?.toNumber() || 0;

    const recentOrders = await this.prisma.client.order.findMany({
      where: {
        status: {
          in: [OrderStatus.PAID, OrderStatus.PENDING],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          select: {
            productName: true,
            quantity: true,
            productPrice: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const topProducts = await this.prisma.client.orderItem.groupBy({
      by: ['productId', 'productName'],
      where: {
        order: {
          status: OrderStatus.PAID,
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    const ordersToDeliver = await this.prisma.client.order.count({
      where: {
        status: OrderStatus.PAID,
      },
    });

    return {
      customers: {
        total: totalCustomers.length,
        totalWithOrders: totalCustomers.length,
      },
      orders: {
        total: totalOrdersPaid + totalOrdersPending + totalOrdersCanceled,
        paid: totalOrdersPaid,
        pending: totalOrdersPending,
        canceled: totalOrdersCanceled,
      },
      sales: {
        total: totalSales,
        formatted: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(totalSales),
      },
      deliveries: {
        toDeliver: ordersToDeliver,
        delivered: 0,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        status: order.status,
        total: Number(order.total),
        createdAt: order.createdAt,
        customer: {
          id: order.user.id,
          name: order.user.name,
          email: order.user.email,
        },
        items: order.items,
      })),
      topProducts: topProducts.map((product) => ({
        productId: product.productId,
        productName: product.productName,
        totalSold: product._sum.quantity || 0,
      })),
    };
  }

  async getSalesChart(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await this.prisma.client.order.findMany({
      where: {
        status: OrderStatus.PAID,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const salesByDay = sales.reduce((acc, order) => {
      if (!order.createdAt) return acc;
      const date = order.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, total: 0, count: 0 };
      }
      acc[date].total += Number(order.total);
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { date: string; total: number; count: number }>);

    return Object.values(salesByDay);
  }
}
