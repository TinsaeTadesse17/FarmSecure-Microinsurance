import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DfsController } from './dfs.controller';
import { DfsService } from './dfs.service';
import { AuthModule } from '../auth/auth.module'; // Assuming AuthModule provides JwtAuthGuard and RolesGuard

@Module({
  imports: [HttpModule, AuthModule],
  controllers: [DfsController],
  providers: [DfsService],
})
export class DfsModule {}
