import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
    const products = await prisma.product.findMany({
        include: { stocks: true }
    });
    console.log('Produtos e Estoques:', JSON.stringify(products, null, 2));
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
