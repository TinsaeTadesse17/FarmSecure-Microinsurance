import { Test, TestingModule } from '@nestjs/testing';
import { CompanyManagementController } from './companies.controller';
import { CompanyManagementService } from './companies.service';

describe('CompaniesController', () => {
  let controller: CompanyManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyManagementController],
      providers: [CompanyManagementService],
    }).compile();

    controller = module.get<CompanyManagementController>(CompanyManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
