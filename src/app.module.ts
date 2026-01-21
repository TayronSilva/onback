import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; // Importe memoryStorage
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AddressModule } from './address/address.module';
import { ProductModule } from './product/product.module';
import { StockModule } from './stock/stock.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Configura o Multer para manter o arquivo na memória RAM
    MulterModule.register({
      storage: memoryStorage(),
      // Adicionamos limites para garantir que o Multer processe corretamente
      limits: {
        fileSize: 5 * 1024 * 1024, // Limite de 5 MB por arquivo
        files: 10,                 // Limite de 10 arquivos por requisição
      },
    }),
    JwtModule.registerAsync({
      global: true, 
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    UsersModule,
    AuthModule,
    AddressModule,
    ProductModule,
    StockModule,
  ],
})
export class AppModule {}
