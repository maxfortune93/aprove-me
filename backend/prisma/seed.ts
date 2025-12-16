import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  try {
    const defaultUser = await prisma.user.findUnique({
      where: { login: 'aprovame' },
    });

    if (!defaultUser) {
      const hashedPassword = await bcrypt.hash('aprovame', 10);
      await prisma.user.create({
        data: {
          login: 'aprovame',
          password: hashedPassword,
        },
      });
      console.log(' Usuário padrão criado: login=aprovame, password=aprovame');
    } else {
      console.log('Usuário padrão já existe');
    }

    console.log('✨ Seed concluído!');
  } catch (error) {
    console.error('Erro durante seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch (e) {
      
    }
  });
