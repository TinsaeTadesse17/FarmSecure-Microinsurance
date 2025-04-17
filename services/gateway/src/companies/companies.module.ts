// src/company-management/company-management.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CompanyManagementController } from './companies.controller';
import { CompanyManagementService } from './companies.service';

@Module({
  imports: [HttpModule],
  controllers: [CompanyManagementController],
  providers: [CompanyManagementService],
  exports: [CompanyManagementService],
})
export class CompanyManagementModule {}
