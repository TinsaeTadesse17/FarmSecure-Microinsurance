import { Module } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { PoliciesController } from './policies.controller';
import {HttpModule} from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  controllers: [PoliciesController],
  providers: [PoliciesService],
})
export class PoliciesModule {}



