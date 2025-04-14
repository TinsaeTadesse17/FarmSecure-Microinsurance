import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NdviService } from './ndvi.service';
import { CreateNdviDto } from './dto/create-ndvi.dto';
import { UpdateNdviDto } from './dto/update-ndvi.dto';

@Controller('ndvi')
export class NdviController {
  constructor(private readonly ndviService: NdviService) {}

  @Post()
  create(@Body() createNdviDto: CreateNdviDto) {
    return this.ndviService.create(createNdviDto);
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
  update(@Param('id') id: string, @Body() updateNdviDto: UpdateNdviDto) {
    return this.ndviService.update(+id, updateNdviDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ndviService.remove(+id);
  }
}
