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

    const createdProduct = await this.prisma.client.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description ?? null,
          price: Number(dto.price),
          weight: dto.weight ? Number(dto.weight) : null,
          width: dto.width ? Number(dto.width) : null,
          height: dto.height ? Number(dto.height) : null,
          length: dto.length ? Number(dto.length) : null,
          active: true,
        },
      });

      if (dto.stocks && dto.stocks.length > 0) {
        await tx.stock.createMany({
          data: dto.stocks.map((s) => ({
            productId: product.id,
            size: s.size ?? null,
            color: s.color ?? null,
            quantity: Number(s.quantity),
          })),
        });
      }

      const paths = await Promise.all(
        files.map((file) => this.supabase.uploadImage(file, product.id)),
      );

      await tx.productImages.createMany({
        data: paths.map((path, index) => ({
          path,
          alt: product.name,
          isMain: index === 0,
          productId: product.id,
        })),
      });

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          images: true,
          stocks: true,
        },
      });
    });

    return this.mapProduct(createdProduct);
  }

  async findAll(search?: string) {
    const where: any = {
      active: true,
      stocks: {
        some: {
          quantity: { gt: 0 },
        },
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await this.prisma.client.product.findMany({
      where,
      include: {
        images: true,
        stocks: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products.map((p) => this.mapProduct(p));
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

    if (dto.price) data.price = Number(dto.price);
    if (dto.weight) data.weight = Number(dto.weight);
    if (dto.width) data.width = Number(dto.width);
    if (dto.height) data.height = Number(dto.height);
    if (dto.length) data.length = Number(dto.length);

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
    const baseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/product-images`;

    const totalStock = product.stocks?.reduce(
      (sum: number, s: any) => sum + s.quantity,
      0,
    ) ?? 0;

    const availableSizes = [
      ...new Set(
        product.stocks
          ?.filter((s: any) => s.size && s.quantity > 0)
          .map((s: any) => s.size)
      ),
    ] as string[];

    // Extrair cores únicas (apenas as que têm estoque)
    const availableColors = [
      ...new Set(
        product.stocks
          ?.filter((s: any) => s.color && s.quantity > 0)
          .map((s: any) => s.color)
      ),
    ] as string[];

    const hasSizes = availableSizes.length > 0;
    const hasColors = availableColors.length > 0;
    const hasVariations = hasSizes || hasColors;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      weight: product.weight,
      width: product.width,
      height: product.height,
      length: product.length,
      active: product.active,
      totalStock,
      hasStock: totalStock > 0,
      hasSizes,
      hasColors,
      hasVariations,
      availableSizes,
      availableColors,
      stocks: product.stocks
        ?.filter((s: any) => s.quantity > 0)
        .map((s: any) => ({
          id: s.id,
          size: s.size,
          color: s.color,
          quantity: s.quantity,
        })) ?? [],
      images: product.images?.map((img: any) => ({
        id: img.id,
        alt: img.alt,
        isMain: img.isMain,
        url: `${baseUrl}/${img.path}`,
      })) ?? [],
    };
  }
}