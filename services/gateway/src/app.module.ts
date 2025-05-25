import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CompanyManagementModule } from './companies/companies.module';
import { PoliciesModule } from './policies/policies.module';
import { ClaimsModule } from './claims/claims.module';
import { PaymentsModule } from './payments/payments.module';
import { CommissionsModule } from './commissions/commissions.module';
import { RiskModule } from './risk/risk.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';
import { UsersController } from './users/users.controller';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule, ThrottlerGuard, minutes } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DfsModule } from './dfs/dfs.module';
import { ConfigModule } from './config/config.module'; 
import { ConfigModule } from './config/config.module';


@Module({
  imports: [AuthModule, HttpModule, ProductsModule, CompanyManagementModule, PoliciesModule, ClaimsModule, PaymentsModule, CommissionsModule, RiskModule, ReportsModule, UsersModule, DfsModule, ConfigModule, // Added ConfigModule to imports
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 15,
          ttl: minutes(1), // 60,000 milliseconds
        },
      ],
    }),
  ],
  controllers: [AppController, UsersController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}
