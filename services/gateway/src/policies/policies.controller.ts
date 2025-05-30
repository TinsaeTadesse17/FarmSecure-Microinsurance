import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/constants/roles.enum';

@ApiTags('Policies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Roles(Role.Agent, Role.IC)
  @Post('policy')
  @ApiOperation({ summary: 'Create a new policy' })
  @ApiResponse({ status: 201, description: 'Policy created successfully' })
  async createPolicy(@Body() policyCreateSchema: any) {
    return this.policiesService.createPolicy(policyCreateSchema);
  }

  @Roles(Role.IC)
  @Post('policy/:policy_id/approve')
  @ApiOperation({ summary: 'Approve a policy' })
  @ApiResponse({ status: 200, description: 'Policy approved successfully' })
  async approvePolicy(@Param('policy_id') policy_id: string) {
    return this.policiesService.approvePolicy(policy_id);
  }

  @Roles(Role.IC)
  @Post('policy/:policy_id/reject')
  @ApiOperation({ summary: 'Reject a policy' })
  @ApiResponse({ status: 200, description: 'Policy rejected successfully' })
  async rejectPolicy(@Param('policy_id') policy_id: string) {
    return this.policiesService.rejectPolicy(policy_id);
  }

  @Roles(Role.Agent, Role.IC)
  @Get('policy/:policy_id/details')
  @ApiOperation({ summary: 'Get policy details by policy ID' })
  @ApiResponse({ status: 200, description: 'Returns policy details' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async getPolicyDetails(@Param('policy_id') policy_id: string) {
    return this.policiesService.getPolicyDetails(policy_id);
  }

  @Roles(Role.Agent, Role.IC)
  @Get('/policies') // Adjusted path to avoid conflict with /api/v1/policy/:policy_id
  @ApiOperation({ summary: 'List all policies' })
  @ApiResponse({ status: 200, description: 'Returns a list of policies' })
  async getAllPolicies() {
    return this.policiesService.getAllPolicies();
  }

  @Roles(Role.Agent, Role.IC)
  @Get('/policies/by-company/:company_id') // Adjusted path to avoid conflict with /api/v1/policy/:policy_id
  @ApiOperation({ summary: 'List all policies' })
  @ApiResponse({ status: 200, description: 'Returns a list of policies' })
  async getAllPoliciesByCompany(@Param('company_id') company_id: number) {
    return this.policiesService.getAllPoliciesByCompany(company_id);
  }

  @Roles(Role.Agent, Role.IC)
  @Get('/policies/by-user/:user_id') // Adjusted path to avoid conflict with /api/v1/policy/:policy_id
  @ApiOperation({ summary: 'List all policies' })
  @ApiResponse({ status: 200, description: 'Returns a list of policies' })
  async getAllPoliciesByUser(@Param('user_id') user_id: number) {
    return this.policiesService.getAllPoliciesByUser(user_id);
  }

  @Roles(Role.Agent, Role.IC)
  @Get('/policy/by-enrollment/:enrollment_id') // Adjusted path to avoid conflict with /api/v1/policy/:policy_id
  @ApiOperation({ summary: 'List all policies' })
  @ApiResponse({ status: 200, description: 'Returns a list of policies' })
  async getAllPoliciesByEnrollment(@Param('enrollment_id') enrollment_id: number) {
    return this.policiesService.getAllPoliciesByEnrollment(enrollment_id);
  }

  @Roles(Role.Agent, Role.IC)
  @Get('/policies/details') // Adjusted path
  @ApiOperation({ summary: 'List all policy details' })
  @ApiResponse({ status: 200, description: 'Returns a list of all policy details' })
  async getAllPolicyDetails() {
    return this.policiesService.getAllPolicyDetails();
  }

  @Roles(Role.Agent, Role.IC)
  @Get('policy/:policy_id')
  @ApiOperation({ summary: 'Get a policy by ID' })
  @ApiResponse({ status: 200, description: 'Returns a single policy' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async getPolicy(@Param('policy_id') policy_id: string) {
    return this.policiesService.getPolicy(policy_id);
  }

}
