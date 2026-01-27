import { PrismaClient, Rule } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

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
  console.log('🌱 Iniciando Seed no banco Neon...');

  console.log('📋 Criando regras de permissão...');

  const rules = [
    { name: 'Visualizar Produtos', slug: 'product:view', description: 'Permite visualizar produtos' },
    { name: 'Criar Produtos', slug: 'product:create', description: 'Permite criar novos produtos' },
    { name: 'Editar Produtos', slug: 'product:update', description: 'Permite editar produtos existentes' },
    { name: 'Deletar Produtos', slug: 'product:delete', description: 'Permite deletar produtos' },
    
    // Regras de Estoque
    { name: 'Visualizar Estoque', slug: 'stock:view', description: 'Permite visualizar estoque' },
    { name: 'Gerenciar Estoque', slug: 'stock:manage', description: 'Permite criar, editar e deletar estoque' },
    
    { name: 'Gerenciar Carrinho', slug: 'cart:manage', description: 'Permite adicionar e remover itens do carrinho' },
    { name: 'Visualizar Pedidos', slug: 'order:view', description: 'Permite visualizar pedidos' },
    { name: 'Gerenciar Pedidos', slug: 'order:manage', description: 'Permite criar, editar e cancelar pedidos' },
    
    { name: 'Gerenciar Endereços', slug: 'address:manage', description: 'Permite criar, editar e deletar endereços' },
    
    { name: 'Visualizar Usuários', slug: 'user:view', description: 'Permite visualizar usuários' },
    { name: 'Gerenciar Usuários', slug: 'user:manage', description: 'Permite criar, editar e deletar usuários' },
    { name: 'Visualizar Perfis de Usuário', slug: 'user:view-profiles', description: 'Permite visualizar perfis de usuários' },
    { name: 'Atribuir Perfil a Usuário', slug: 'user:assign-profile', description: 'Permite atribuir perfis a usuários' },
    { name: 'Remover Perfil de Usuário', slug: 'user:remove-profile', description: 'Permite remover perfis de usuários' },
    
    // Regras de Regras (Meta-permissões)
    { name: 'Visualizar Regras', slug: 'rule:view', description: 'Permite visualizar regras de permissão' },
    { name: 'Criar Regras', slug: 'rule:create', description: 'Permite criar novas regras de permissão' },
    { name: 'Editar Regras', slug: 'rule:update', description: 'Permite editar regras de permissão' },
    { name: 'Deletar Regras', slug: 'rule:delete', description: 'Permite deletar regras de permissão' },
    
    { name: 'Visualizar Perfis', slug: 'profile:view', description: 'Permite visualizar perfis de acesso' },
    { name: 'Criar Perfis', slug: 'profile:create', description: 'Permite criar novos perfis de acesso' },
    { name: 'Editar Perfis', slug: 'profile:update', description: 'Permite editar perfis de acesso' },
    { name: 'Deletar Perfis', slug: 'profile:delete', description: 'Permite deletar perfis de acesso' },
    
    { name: 'Visualizar Pagamentos', slug: 'payment:view', description: 'Permite visualizar pagamentos' },
    { name: 'Gerenciar Pagamentos', slug: 'payment:manage', description: 'Permite gerenciar pagamentos' },
    
    { name: 'Gerenciar Webhooks', slug: 'webhook:manage', description: 'Permite gerenciar webhooks' },
  ];

  const createdRules: Rule[] = [];
  
  for (const rule of rules) {
    const created = await prisma.rule.upsert({
      where: { slug: rule.slug },
      update: {
        name: rule.name,
        description: rule.description,
      },
      create: rule,
    });
    createdRules.push(created as Rule);
  }

  console.log(`✅ ${createdRules.length} regras criadas/atualizadas`);

  console.log('👑 Criando perfil OWNER...');
  
  const ownerProfile = await prisma.accessProfile.upsert({
    where: { name: 'OWNER' },
    update: {
      description: 'Perfil supremo com acesso total ao sistema. Possui todas as permissões automaticamente.',
      rules: {
        set: createdRules.map((rule) => ({ id: rule.id })),
      },
    },
    create: {
      name: 'OWNER',
      description: 'Perfil supremo com acesso total ao sistema. Possui todas as permissões automaticamente.',
      rules: {
        connect: createdRules.map((rule) => ({ id: rule.id })),
      },
    },
  });

  console.log('✅ Perfil OWNER criado com todas as regras');

  console.log('👥 Criando perfis específicos...');

  const customerRules = createdRules.filter(
    (r) => ['product:view', 'cart:manage', 'order:view', 'address:manage'].includes(r.slug),
  );
  await prisma.accessProfile.upsert({
    where: { name: 'CUSTOMER' },
    update: {
      description: 'Perfil padrão para novos usuários do site',
      rules: {
        set: customerRules.map((rule) => ({ id: rule.id })),
      },
    },
    create: {
      name: 'CUSTOMER',
      description: 'Perfil padrão para novos usuários do site',
      rules: {
        connect: customerRules.map((rule) => ({ id: rule.id })),
      },
    },
  });

  const stockRules = createdRules.filter(
    (r) => ['product:view', 'stock:view', 'stock:manage'].includes(r.slug),
  );
  await prisma.accessProfile.upsert({
    where: { name: 'MOD_STOCK' },
    update: {
      description: 'Moderador de estoque - pode visualizar produtos e gerenciar estoque',
      rules: {
        set: stockRules.map((rule) => ({ id: rule.id })),
      },
    },
    create: {
      name: 'MOD_STOCK',
      description: 'Moderador de estoque - pode visualizar produtos e gerenciar estoque',
      rules: {
        connect: stockRules.map((rule) => ({ id: rule.id })),
      },
    },
  });

  const productAdminRules = createdRules.filter(
    (r) => r.slug.startsWith('product:') || r.slug.startsWith('stock:'),
  );
  await prisma.accessProfile.upsert({
    where: { name: 'ADMIN_PRODUCTS' },
    update: {
      description: 'Administrador de produtos - pode gerenciar produtos e estoque',
      rules: {
        set: productAdminRules.map((rule) => ({ id: rule.id })),
      },
    },
    create: {
      name: 'ADMIN_PRODUCTS',
      description: 'Administrador de produtos - pode gerenciar produtos e estoque',
      rules: {
        connect: productAdminRules.map((rule) => ({ id: rule.id })),
      },
    },
  });

  const designerRules = createdRules.filter(
    (r) => ['product:view', 'product:update'].includes(r.slug),
  );
  await prisma.accessProfile.upsert({
    where: { name: 'DESIGNER_SITE' },
    update: {
      description: 'Designer do site - pode visualizar e editar produtos',
      rules: {
        set: designerRules.map((rule) => ({ id: rule.id })),
      },
    },
    create: {
      name: 'DESIGNER_SITE',
      description: 'Designer do site - pode visualizar e editar produtos',
      rules: {
        connect: designerRules.map((rule) => ({ id: rule.id })),
      },
    },
  });

  const orderManagerRules = createdRules.filter(
    (r) => r.slug.startsWith('order:') || r.slug.startsWith('payment:') || r.slug === 'user:view',
  );
  await prisma.accessProfile.upsert({
    where: { name: 'ORDER_MANAGER' },
    update: {
      description: 'Gerente de pedidos - pode gerenciar pedidos e pagamentos',
      rules: {
        set: orderManagerRules.map((rule) => ({ id: rule.id })),
      },
    },
    create: {
      name: 'ORDER_MANAGER',
      description: 'Gerente de pedidos - pode gerenciar pedidos e pagamentos',
      rules: {
        connect: orderManagerRules.map((rule) => ({ id: rule.id })),
      },
    },
  });

  console.log('✅ Perfis específicos criados');

  // ========== CRIANDO PERFIS HIERÁRQUICOS ==========
  console.log('👔 Criando perfis hierárquicos...');

  // ADMIN - Quase tudo, exceto gerenciar perfis/regras (meta-permissões)
  const adminRules = createdRules.filter(
    (r) => !r.slug.startsWith('rule:') && !r.slug.startsWith('profile:') && !r.slug.startsWith('user:assign-profile') && !r.slug.startsWith('user:remove-profile'),
  );
  const adminProfile = await prisma.accessProfile.upsert({
    where: { name: 'ADMIN' },
    update: {
      description: 'Administrador - acesso quase total, exceto gerenciar perfis e regras',
      rules: {
        set: adminRules.map((rule) => ({ id: rule.id })),
      },
    },
    create: {
      name: 'ADMIN',
      description: 'Administrador - acesso quase total, exceto gerenciar perfis e regras',
      rules: {
        connect: adminRules.map((rule) => ({ id: rule.id })),
      },
    },
  });

  // MANAGER - Gerencia operações do dia a dia
  const managerRules = createdRules.filter(
    (r) => 
      r.slug.startsWith('product:') || 
      r.slug.startsWith('stock:') || 
      r.slug.startsWith('order:') || 
      r.slug.startsWith('payment:') || 
      r.slug === 'user:view' ||
      r.slug === 'address:manage',
  );
  const managerProfile = await prisma.accessProfile.upsert({
    where: { name: 'MANAGER' },
    update: {
      description: 'Gerente - gerencia produtos, estoque, pedidos, pagamentos e visualiza usuários',
      rules: {
        set: managerRules.map((rule) => ({ id: rule.id })),
      },
    },
    create: {
      name: 'MANAGER',
      description: 'Gerente - gerencia produtos, estoque, pedidos, pagamentos e visualiza usuários',
      rules: {
        connect: managerRules.map((rule) => ({ id: rule.id })),
      },
    },
  });

  // STAFF - Operações básicas de produtos e estoque
  const staffRules = createdRules.filter(
    (r) => 
      r.slug === 'product:view' || 
      r.slug === 'product:update' || 
      r.slug.startsWith('stock:'),
  );
  const staffProfile = await prisma.accessProfile.upsert({
    where: { name: 'STAFF' },
    update: {
      description: 'Equipe - visualiza e edita produtos, gerencia estoque',
      rules: {
        set: staffRules.map((rule) => ({ id: rule.id })),
      },
    },
    create: {
      name: 'STAFF',
      description: 'Equipe - visualiza e edita produtos, gerencia estoque',
      rules: {
        connect: staffRules.map((rule) => ({ id: rule.id })),
      },
    },
  });

  // SUPPORT - Atendimento ao cliente
  const supportRules = createdRules.filter(
    (r) => 
      r.slug === 'order:view' || 
      r.slug === 'user:view' || 
      r.slug === 'address:manage' ||
      r.slug === 'product:view',
  );
  const supportProfile = await prisma.accessProfile.upsert({
    where: { name: 'SUPPORT' },
    update: {
      description: 'Suporte - visualiza pedidos, usuários, endereços e produtos',
      rules: {
        set: supportRules.map((rule) => ({ id: rule.id })),
      },
    },
    create: {
      name: 'SUPPORT',
      description: 'Suporte - visualiza pedidos, usuários, endereços e produtos',
      rules: {
        connect: supportRules.map((rule) => ({ id: rule.id })),
      },
    },
  });

  // VIEWER - Apenas visualização
  const viewerRules = createdRules.filter(
    (r) => 
      r.slug === 'product:view' || 
      r.slug === 'stock:view' || 
      r.slug === 'order:view' ||
      r.slug === 'user:view',
  );
  const viewerProfile = await prisma.accessProfile.upsert({
    where: { name: 'VIEWER' },
    update: {
      description: 'Visualizador - apenas visualização de produtos, estoque, pedidos e usuários',
      rules: {
        set: viewerRules.map((rule) => ({ id: rule.id })),
      },
    },
    create: {
      name: 'VIEWER',
      description: 'Visualizador - apenas visualização de produtos, estoque, pedidos e usuários',
      rules: {
        connect: viewerRules.map((rule) => ({ id: rule.id })),
      },
    },
  });

  console.log('✅ Perfis hierárquicos criados');

  // ========== CRIANDO USUÁRIOS DE EXEMPLO ==========
  console.log('👤 Criando usuários de exemplo...');

  const defaultPassword = await bcrypt.hash('senha123', 6);

  // Usuário OWNER
  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@onback.com' },
    update: {
      profiles: {
        deleteMany: {},
        create: {
          accessProfileId: ownerProfile.id,
        },
      },
    },
    create: {
      cpf: '00000000000',
      name: 'Owner',
      email: 'owner@onback.com',
      password: defaultPassword,
      profiles: {
        create: {
          accessProfileId: ownerProfile.id,
        },
      },
    },
  });

  // Usuário ADMIN
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@onback.com' },
    update: {
      profiles: {
        deleteMany: {},
        create: {
          accessProfileId: adminProfile.id,
        },
      },
    },
    create: {
      cpf: '11111111111',
      name: 'Admin',
      email: 'admin@onback.com',
      password: defaultPassword,
      profiles: {
        create: {
          accessProfileId: adminProfile.id,
        },
      },
    },
  });

  // Usuário MANAGER
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@onback.com' },
    update: {
      profiles: {
        deleteMany: {},
        create: {
          accessProfileId: managerProfile.id,
        },
      },
    },
    create: {
      cpf: '22222222222',
      name: 'Manager',
      email: 'manager@onback.com',
      password: defaultPassword,
      profiles: {
        create: {
          accessProfileId: managerProfile.id,
        },
      },
    },
  });

  // Usuário STAFF
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@onback.com' },
    update: {
      profiles: {
        deleteMany: {},
        create: {
          accessProfileId: staffProfile.id,
        },
      },
    },
    create: {
      cpf: '33333333333',
      name: 'Staff',
      email: 'staff@onback.com',
      password: defaultPassword,
      profiles: {
        create: {
          accessProfileId: staffProfile.id,
        },
      },
    },
  });

  // Usuário SUPPORT
  const supportUser = await prisma.user.upsert({
    where: { email: 'support@onback.com' },
    update: {
      profiles: {
        deleteMany: {},
        create: {
          accessProfileId: supportProfile.id,
        },
      },
    },
    create: {
      cpf: '44444444444',
      name: 'Support',
      email: 'support@onback.com',
      password: defaultPassword,
      profiles: {
        create: {
          accessProfileId: supportProfile.id,
        },
      },
    },
  });

  // Usuário VIEWER
  const viewerUser = await prisma.user.upsert({
    where: { email: 'viewer@onback.com' },
    update: {
      profiles: {
        deleteMany: {},
        create: {
          accessProfileId: viewerProfile.id,
        },
      },
    },
    create: {
      cpf: '55555555555',
      name: 'Viewer',
      email: 'viewer@onback.com',
      password: defaultPassword,
      profiles: {
        create: {
          accessProfileId: viewerProfile.id,
        },
      },
    },
  });

  console.log('✅ Usuários de exemplo criados');

  console.log('✅ Seed finalizado com sucesso!');
  console.log(`📊 Resumo:`);
  console.log(`   - ${createdRules.length} regras criadas`);
  console.log(`   - 11 perfis criados (OWNER, CUSTOMER, MOD_STOCK, ADMIN_PRODUCTS, DESIGNER_SITE, ORDER_MANAGER, ADMIN, MANAGER, STAFF, SUPPORT, VIEWER)`);
  console.log(`   - 6 usuários de exemplo criados:`);
  console.log(`     👑 owner@onback.com (OWNER) - senha: senha123`);
  console.log(`     👔 admin@onback.com (ADMIN) - senha: senha123`);
  console.log(`     📊 manager@onback.com (MANAGER) - senha: senha123`);
  console.log(`     👷 staff@onback.com (STAFF) - senha: senha123`);
  console.log(`     🎧 support@onback.com (SUPPORT) - senha: senha123`);
  console.log(`     👁️  viewer@onback.com (VIEWER) - senha: senha123`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); 
  });