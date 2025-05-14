import { Injectable } from '@nestjs/common';

@Injectable()
export class PoliciesService {
  create() {
    return 'This action adds a new policy';
  }

  findAll() {
    return `This action returns all policies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} policy`;
  }

  update(id: number) {
    return `This action updates a #${id} policy`;
  }

  remove(id: number) {
    return `This action removes a #${id} policy`;
  }
}
