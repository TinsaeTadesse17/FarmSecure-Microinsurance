import { Injectable } from '@nestjs/common';

@Injectable()
export class NdviService {
  create() {
    return 'This action adds a new ndvi';
  }

  findAll() {
    return `This action returns all ndvi`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ndvi`;
  }

  update(id: number) {
    return `This action updates a #${id} ndvi`;
  }

  remove(id: number) {
    return `This action removes a #${id} ndvi`;
  }
}
