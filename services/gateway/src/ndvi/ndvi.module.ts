import { Module } from '@nestjs/common';
import { NdviService } from './ndvi.service';
import { NdviController } from './ndvi.controller';

@Module({
  controllers: [NdviController],
  providers: [NdviService],
})
export class NdviModule {}
