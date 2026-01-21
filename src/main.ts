import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); 
  
  console.log('--- TESTE DE VARIÁVEIS ---');
  console.log('URL:', process.env.SUPABASE_URL);
  console.log('KEY:', process.env.SUPABASE_KEY ? 'Preenchida' : 'Vazia');
  console.log('--------------------------');

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
