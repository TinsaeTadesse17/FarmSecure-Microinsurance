import { forwardRef, Module } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { HttpModule } from '@nestjs/axios';
import { ClaimsController } from './claims.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
        HttpModule,
        forwardRef(() => AuthModule), 
      ],
  controllers: [ClaimsController],
  providers: [ClaimsService],
})
export class ClaimsModule {}
