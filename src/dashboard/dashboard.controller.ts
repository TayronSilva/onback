import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard, RequirePermission } from '../permissions/permissions.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(AuthGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('statistics')
  @RequirePermission('order:view', 'user:view')
  @ApiOperation({ summary: 'Obter estatísticas do dashboard' })
  async getStatistics() {
    return this.dashboardService.getStatistics();
  }

  @Get('sales-chart')
  @RequirePermission('order:view')
  @ApiOperation({ summary: 'Obter dados do gráfico de vendas' })
  async getSalesChart(
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ) {
    return this.dashboardService.getSalesChart(days || 30);
  }
}
