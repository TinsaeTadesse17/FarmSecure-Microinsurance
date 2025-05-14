import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PoliciesService } from './policies.service';

@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Post()
  create( ) {
    return this.policiesService.create();
  }

  @Get()
  findAll() {
    return this.policiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.policiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.policiesService.update(+id );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.policiesService.remove(+id);
  }
}
