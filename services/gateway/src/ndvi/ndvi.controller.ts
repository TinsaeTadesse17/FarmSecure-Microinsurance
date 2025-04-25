import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NdviService } from './ndvi.service';

@Controller('ndvi')
export class NdviController {
  constructor(private readonly ndviService: NdviService) {}

  @Post()
  create( ) {
    return this.ndviService.create();
  }

  @Get()
  findAll() {
    return this.ndviService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ndviService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.ndviService.update(+id );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ndviService.remove(+id);
  }
}
