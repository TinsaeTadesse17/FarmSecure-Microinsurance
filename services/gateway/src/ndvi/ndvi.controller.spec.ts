import { Test, TestingModule } from '@nestjs/testing';
import { NdviController } from './ndvi.controller';
import { NdviService } from './ndvi.service';

describe('NdviController', () => {
  let controller: NdviController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NdviController],
      providers: [NdviService],
    }).compile();

    controller = module.get<NdviController>(NdviController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
