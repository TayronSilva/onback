import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private prisma: PrismaClient;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const adapter = new PrismaPg(pool);

    this.prisma = new PrismaClient({
      adapter,
    });
  }

  async onModuleInit() {
    await this.prisma.$connect();
    this.logger.log('✅ Prisma conectado com sucesso!');
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  get client() {
    return this.prisma;
  }
}
