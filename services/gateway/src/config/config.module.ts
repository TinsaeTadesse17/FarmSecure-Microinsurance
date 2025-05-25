import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => AuthModule), 
        ],
  controllers: [ConfigController],
  providers: [ConfigService],
})
export class ConfigModule {}
