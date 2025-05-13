import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CompanyManagementController } from './companies.controller';
import { CompanyManagementService } from './companies.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
      HttpModule,
      forwardRef(() => AuthModule), 
    ],
  controllers: [CompanyManagementController],
  providers: [CompanyManagementService],
  exports: [CompanyManagementService],
})
export class CompanyManagementModule {}
