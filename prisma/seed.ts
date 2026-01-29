import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const rulesData = [
    { name: 'Visualizar Produtos', slug: 'product:view', description: 'Permite visualizar produtos' },
    { name: 'Criar Produtos', slug: 'product:create', description: 'Permite criar novos produtos' },
    { name: 'Editar Produtos', slug: 'product:update', description: 'Permite editar produtos existentes' },
    { name: 'Deletar Produtos', slug: 'product:delete', description: 'Permite deletar produtos' },
    { name: 'Visualizar Estoque', slug: 'stock:view', description: 'Permite visualizar estoque' },
    { name: 'Gerenciar Estoque', slug: 'stock:manage', description: 'Permite gerenciar estoque' },
    { name: 'Gerenciar Carrinho', slug: 'cart:manage', description: 'Permite gerenciar o carrinho' },
    { name: 'Visualizar Pedidos', slug: 'order:view', description: 'Permite visualizar pedidos' },
    { name: 'Gerenciar Pedidos', slug: 'order:manage', description: 'Permite gerenciar pedidos' },
    { name: 'Gerenciar Endereços', slug: 'address:manage', description: 'Permite gerenciar endereços' },
    { name: 'Visualizar Usuários', slug: 'user:view', description: 'Permite visualizar usuários' },
    { name: 'Gerenciar Usuários', slug: 'user:manage', description: 'Permite gerenciar usuários' },
    { name: 'Visualizar Perfis', slug: 'profile:view', description: 'Permite visualizar perfis' },
    { name: 'Criar Perfis', slug: 'profile:create', description: 'Permite criar perfis' },
    { name: 'Editar Perfis', slug: 'profile:update', description: 'Permite editar perfis' },
    { name: 'Deletar Perfis', slug: 'profile:delete', description: 'Permite deletar perfis' },
    { name: 'Visualizar Pagamentos', slug: 'payment:view', description: 'Permite visualizar pagamentos' },
    { name: 'Gerenciar Pagamentos', slug: 'payment:manage', description: 'Permite gerenciar pagamentos' },
    { name: 'Gerenciar Webhooks', slug: 'webhook:manage', description: 'Permite gerenciar webhooks' }
  ];

  for (const rule of rulesData) {
    await prisma.rule.upsert({
      where: { slug: rule.slug },
      update: { name: rule.name, description: rule.description },
      create: rule,
    });
  }

  const allRules = await prisma.rule.findMany();

  const ownerProfile = await prisma.accessProfile.upsert({
    where: { name: 'OWNER' },
    update: {
      rules: { set: allRules.map(r => ({ id: r.id })) }
    },
    create: {
      name: 'OWNER',
      description: 'Acesso total',
      rules: { connect: allRules.map(r => ({ id: r.id })) }
    }
  });

  const customerProfile = await prisma.accessProfile.upsert({
    where: { name: 'CUSTOMER' },
    update: {
      rules: {
        set: allRules
          .filter(r => ['product:view', 'order:manage', 'cart:manage', 'address:manage', 'order:view'].includes(r.slug))
          .map(r => ({ id: r.id }))
      }
    },
    create: {
      name: 'CUSTOMER',
      description: 'Acesso de cliente comum',
      rules: {
        connect: allRules
          .filter(r => ['product:view', 'order:manage', 'cart:manage', 'address:manage', 'order:view'].includes(r.slug))
          .map(r => ({ id: r.id }))
      }
    },
  });

  const hashedPassword = await bcrypt.hash('senha123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@exemplo.com' },
    update: {},
    create: {
      email: 'admin@exemplo.com',
      name: 'Admin Principal',
      cpf: '00000000000',
      password: hashedPassword,
      isActive: true,
    },
  });

  await prisma.userProfile.upsert({
    where: {
      userId_accessProfileId: {
        userId: adminUser.id,
        accessProfileId: ownerProfile.id
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      accessProfileId: ownerProfile.id
    }
  });

  console.log('Seed finalizado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
