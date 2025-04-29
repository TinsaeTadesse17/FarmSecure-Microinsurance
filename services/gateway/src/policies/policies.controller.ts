import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { PoliciesService } from './policies.service';

@Controller('api')
export class PoliciesController {
  constructor(private readonly policyService: PoliciesService) {}

  @Post('/policy')
  async createPolicy(@Body() payload: any) {
    return this.policyService.createPolicy(payload);
  }

  @Post('/policy:policyId/approve')
  async approvePolicy(@Param('policyId') policyId: number) {
    return this.policyService.approvePolicy(policyId);
  }

  @Post('/policy:policyId/reject')
  async rejectPolicy(@Param('policyId') policyId: number) {
    return this.policyService.rejectPolicy(policyId);
  }

  @Get('/policy:policyId')
  async getPolicy(@Param('policyId') policyId: number) {
    return this.policyService.getPolicy(policyId);
  }

  @Get('/policy:policyId/details')
  async getPolicyDetails(@Param('policyId') policyId: number) {
    return this.policyService.getPolicyDetails(policyId);
  }

  @Get('/policies')
  async listPolicies() {
    return this.policyService.listPolicies();
  }

  @Get('/policies/details')
  async listPolicyDetails() {
    return this.policyService.listPolicyDetails();
  }
}
