import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  constructor(private configService: ConfigService) {}

  async uploadImage(
    file: Express.Multer.File,
    productId: string,
  ): Promise<string> {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_KEY');

    const supabase = createClient(url!, key!);

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

    const path = `products/${productId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Erro Supabase: ${error.message}`);
    }

    return data.path;
  }
}


