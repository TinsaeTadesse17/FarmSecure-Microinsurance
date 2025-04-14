import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RiskService } from './risk.service';

@Controller('risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Post()
  create() {
    return this.riskService.create();
  }

  @Get()
  findAll() {
    return this.riskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.riskService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.riskService.update(+id,);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.riskService.remove(+id);
  }
}
