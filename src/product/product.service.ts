import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'database/prisma/prisma.service';
import { SupabaseService } from '../common/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import slugify from 'slugify';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async create(dto: CreateProductDto, files: Express.Multer.File[]) {
    if (!files?.length) {
      throw new Error('At least one image is required');
    }

    const slug = slugify(dto.name, { lower: true, strict: true });

    return this.prisma.client.$transaction(async tx => {
      const product = await tx.product.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description ?? null,
          price: dto.price,
          active: true,
        },
      });

      await tx.stock.createMany({
        data: dto.stocks.map(s => ({
          productId: product.id,
          size: s.size ?? null,
          color: s.color ?? null,
          quantity: s.quantity,
        })),
      });

      const paths = await Promise.all(
        files.map(file => this.supabase.uploadImage(file, product.id)),
      );

      await tx.productImages.createMany({
        data: paths.map((path, index) => ({
          path,
          alt: product.name,
          isMain: index === 0,
          productId: product.id,
        })),
      });

      return this.findOne(product.id);
    });
  }

  async findAll() {
    const products = await this.prisma.client.product.findMany({
      where: {
        active: true,
        stocks: {
          some: {
            quantity: { gt: 0 },
          },
        },
      },
      include: {
        images: true,
        stocks: true,
      },
    });

    return products.map(p => this.mapProduct(p));
  }

  async findOne(id: string) {
    const product = await this.prisma.client.product.findUnique({
      where: { id },
      include: {
        images: true,
        stocks: true,
      },
    });

    if (!product || !product.active) {
      throw new NotFoundException('Product not found');
    }

    return this.mapProduct(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    const data: any = { ...dto };

    if (dto.name) {
      data.slug = slugify(dto.name, { lower: true, strict: true });
    }

    return this.prisma.client.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.client.product.update({
      where: { id },
      data: { active: false },
    });
  }

  private mapProduct(product: any) {
    const baseUrl =
      `${process.env.SUPABASE_URL}/storage/v1/object/public/product-images`;

    const totalStock = product.stocks.reduce(
      (sum, s) => sum + s.quantity,
      0,
    );

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      active: product.active,
      totalStock,

      images: product.images.map(img => ({
        id: img.id,
        alt: img.alt,
        isMain: img.isMain,
        url: `${baseUrl}/${img.path}`,
      })),
    };
  }
}
