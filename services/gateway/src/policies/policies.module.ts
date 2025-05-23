import { forwardRef, Module } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { PoliciesController } from './policies.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PoliciesController],
  imports: [
      HttpModule,
      forwardRef(() => AuthModule), 
    ],
  providers: [PoliciesService],
})
export class PoliciesModule {}
