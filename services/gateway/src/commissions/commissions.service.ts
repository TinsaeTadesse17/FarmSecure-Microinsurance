import { Injectable } from '@nestjs/common';

@Injectable()
export class CommissionsService {
  create() {
    return 'This action adds a new commission';
  }

  findAll() {
    return `This action returns all commissions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} commission`;
  }

  update(id: number) {
    return `This action updates a #${id} commission`;
  }

  remove(id: number) {
    return `This action removes a #${id} commission`;
  }
}
