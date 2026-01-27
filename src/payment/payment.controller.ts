import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard, RequirePermission } from '../permissions/permissions.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('payment')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(AuthGuard, PermissionsGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('card')
  @RequirePermission('order:manage', 'cart:manage')
  @ApiOperation({ summary: 'Processar pagamento por cartão de crédito/débito' })
  async createCardPayment(@Body() dto: {
    orderId: string;
    token: string;
    installments?: number;
    paymentMethodId?: 'credit_card' | 'debit_card';
  }) {
    const order = await this.paymentService.getOrderData(dto.orderId);
    
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    return this.paymentService.createCardPayment({
      id: order.id,
      total: order.total,
      user: {
        email: order.user.email,
        name: order.user.name || 'Cliente',
        cpf: order.user.cpf?.replace(/\D/g, '') || '',
      },
      token: dto.token,
      installments: dto.installments || 1,
      paymentMethodId: dto.paymentMethodId || 'credit_card',
    });
  }
}
