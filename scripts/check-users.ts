import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Erro: DATABASE_URL não encontrada no arquivo .env');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔍 Verificando usuários no banco...\n');

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        cpf: true,
        profiles: {
          include: {
            accessProfile: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    console.log(`✅ Encontrados ${users.length} usuários:\n`);

    users.forEach((user) => {
      console.log(`📧 Email: ${user.email}`);
      console.log(`   Nome: ${user.name || 'N/A'}`);
      console.log(`   CPF: ${user.cpf}`);
      console.log(`   Perfis: ${user.profiles.map((p) => p.accessProfile.name).join(', ') || 'Nenhum'}`);
      console.log('');
    });

    // Verificar especificamente o staff
    const staffUser = await prisma.user.findFirst({
      where: { email: 'staff@onback.com' },
    });

    if (staffUser) {
      console.log('✅ Usuário staff@onback.com encontrado!');
      console.log(`   ID: ${staffUser.id}`);
      console.log(`   Email: ${staffUser.email}`);
    } else {
      console.log('❌ Usuário staff@onback.com NÃO encontrado!');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
