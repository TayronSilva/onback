import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'database/prisma/prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.stock.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        product: {
          createdAt: 'desc',
        },
      },
    });
  }

  async create(dto: CreateStockDto) {
    return this.prisma.client.stock.create({
      data: {
        productId: dto.productId,
        size: dto.size ?? null,
        color: dto.color ?? null,
        quantity: dto.quantity,
      },
    });
  }

  async update(id: string, dto: UpdateStockDto) {
    const stock = await this.prisma.client.stock.findUnique({
      where: { id },
    });

    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    return this.prisma.client.stock.update({
      where: { id },
      data: {
        size: dto.size ?? stock.size,
        color: dto.color ?? stock.color,
        quantity: dto.quantity ?? stock.quantity,
      },
    });
  }

  async remove(id: string) {
    const stock = await this.prisma.client.stock.findUnique({
      where: { id },
    });

    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    return this.prisma.client.stock.delete({
      where: { id },
    });
  }
}
