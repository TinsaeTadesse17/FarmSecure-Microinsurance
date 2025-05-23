import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ClaimsService } from './claims.service';
import { ClaimsController } from './claims.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ClaimsController],
  providers: [ClaimsService],
  imports: [
        HttpModule,
        forwardRef(() => AuthModule), 
      ],
})
export class ClaimsModule {}
