// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// 1. Carregar variáveis de ambiente
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Erro: DATABASE_URL não encontrada no arquivo .env');
  process.exit(1);
}

// 2. Configurar o Adapter (Igual ao seu PrismaService)
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando Seed no banco Neon...');

  // 1. Criar Regras Básicas (Permissões)
  const ruleView = await prisma.rule.upsert({
    where: { slug: 'product:view' },
    update: {},
    create: {
      name: 'Visualizar Produtos',
      slug: 'product:view',
      description: 'Permite que o cliente veja as mochilas',
    },
  });

  const ruleCart = await prisma.rule.upsert({
    where: { slug: 'cart:manage' },
    update: {},
    create: {
      name: 'Gerenciar Carrinho',
      slug: 'cart:manage',
      description: 'Permite adicionar e remover itens do carrinho',
    },
  });

  // 2. Criar Perfil CUSTOMER e conectar as regras
  await prisma.accessProfile.upsert({
    where: { name: 'CUSTOMER' },
    update: {},
    create: {
      name: 'CUSTOMER',
      description: 'Perfil padrão para novos usuários do site',
      rules: {
        connect: [{ id: ruleView.id }, { id: ruleCart.id }],
      },
    },
  });

  // 3. Criar Perfil ADMIN
  await prisma.accessProfile.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Dono da loja com acesso total',
    },
  });

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Fecha a conexão do pool também
  });