import { Injectable } from '@nestjs/common';
import { CreateNdviDto } from './dto/create-ndvi.dto';
import { UpdateNdviDto } from './dto/update-ndvi.dto';

@Injectable()
export class NdviService {
  create(createNdviDto: CreateNdviDto) {
    return 'This action adds a new ndvi';
  }

  findAll() {
    return `This action returns all ndvi`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ndvi`;
  }

  update(id: number, updateNdviDto: UpdateNdviDto) {
    return `This action updates a #${id} ndvi`;
  }

  remove(id: number) {
    return `This action removes a #${id} ndvi`;
  }
}
