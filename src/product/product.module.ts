import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { SupabaseService } from 'src/common/supabase.service';
import { PrismaService } from 'database/prisma/prisma.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, SupabaseService, PrismaService],
})
export class ProductModule {}
