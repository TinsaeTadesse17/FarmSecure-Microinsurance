import { Injectable } from '@nestjs/common';

@Injectable()
export class RiskService {
  create() {
    return 'This action adds a new risk';
  }

  findAll() {
    return `This action returns all risk`;
  }

  findOne(id: number) {
    return `This action returns a #${id} risk`;
  }

  update(id: number) {
    return `This action updates a #${id} risk`;
  }

  remove(id: number) {
    return `This action removes a #${id} risk`;
  }
}
