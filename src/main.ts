import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  dotenv.config(); 
  
  console.log('--- TESTE DE VARIÁVEIS ---');
  console.log('URL:', process.env.SUPABASE_URL);
  console.log('KEY:', process.env.SUPABASE_KEY ? 'Preenchida' : 'Vazia');
  console.log('--------------------------');

  app.use(
    bodyParser.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf.toString();
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  await app.listen(3000);
  console.log('🚀 Backend OnBack rodando na porta 3000');
}
bootstrap();