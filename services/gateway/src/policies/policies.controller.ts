import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { PoliciesService } from './policies.service';

@Controller('policies')
export class PoliciesController {
  constructor(private readonly policyService: PoliciesService) {}

  @Post()
  async createPolicy(@Body() payload: any) {
    return this.policyService.createPolicy(payload);
  }

  @Post(':policyId/approve')
  async approvePolicy(@Param('policyId') policyId: number) {
    return this.policyService.approvePolicy(policyId);
  }

  @Post(':policyId/reject')
  async rejectPolicy(@Param('policyId') policyId: number) {
    return this.policyService.rejectPolicy(policyId);
  }

  @Get(':policyId')
  async getPolicy(@Param('policyId') policyId: number) {
    return this.policyService.getPolicy(policyId);
  }

  @Get(':policyId/details')
  async getPolicyDetails(@Param('policyId') policyId: number) {
    return this.policyService.getPolicyDetails(policyId);
  }

  @Get()
  async listPolicies() {
    return this.policyService.listPolicies();
  }

  @Get('details')
  async listPolicyDetails() {
    return this.policyService.listPolicyDetails();
  }
}
