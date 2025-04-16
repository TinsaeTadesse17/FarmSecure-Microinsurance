import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CompaniesModule } from './companies/companies.module';
import { PoliciesModule } from './policies/policies.module';
import { ClaimsModule } from './claims/claims.module';
import { PaymentsModule } from './payments/payments.module';
import { CommissionsModule } from './commissions/commissions.module';
import { RiskModule } from './risk/risk.module';
import { NdviModule } from './ndvi/ndvi.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';
import { UsersController } from './users/users.controller';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [AuthModule,HttpModule, ProductsModule, CompaniesModule, PoliciesModule, ClaimsModule, PaymentsModule, CommissionsModule, RiskModule, NdviModule, DashboardModule, ReportsModule, UsersModule],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {}
