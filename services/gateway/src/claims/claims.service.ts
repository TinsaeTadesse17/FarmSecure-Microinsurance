import { Injectable } from '@nestjs/common';

@Injectable()
export class ClaimsService {
  create() {
    return 'This action adds a new claim';
  }

  findAll() {
    return `This action returns all claims`;
  }

  findOne(id: number) {
    return `This action returns a #${id} claim`;
  }

  update(id: number) {
    return `This action updates a #${id} claim`;
  }

  remove(id: number) {
    return `This action removes a #${id} claim`;
  }
}
