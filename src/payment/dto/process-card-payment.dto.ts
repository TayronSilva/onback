import { IsNotEmpty, IsOptional, IsString, IsNumber, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessCardPaymentDto {
    @ApiProperty({ description: 'ID do pedido gerado anteriormente' })
    @IsNotEmpty()
    @IsString()
    orderId: string;

    @ApiProperty({ description: 'Token gerado pelo SDK do Mercado Pago no frontend' })
    @IsNotEmpty()
    @IsString()
    token: string;

    @ApiProperty({ description: 'Número de parcelas', default: 1 })
    @IsOptional()
    @IsNumber()
    installments?: number;

    @ApiProperty({ description: 'Método de pagamento', enum: ['credit_card', 'debit_card'], default: 'credit_card' })
    @IsOptional()
    @IsString()
    @IsIn(['credit_card', 'debit_card'])
    paymentMethodId?: 'credit_card' | 'debit_card';
}
