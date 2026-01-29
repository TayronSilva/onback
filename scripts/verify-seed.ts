import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verify() {
    const profiles = await prisma.accessProfile.findMany({
        include: { _count: { select: { rules: true } } }
    });
    console.log('Perfis encontrados:', JSON.stringify(profiles, null, 2));

    const rules = await prisma.rule.count();
    console.log('Total de regras:', rules);
}

verify()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
