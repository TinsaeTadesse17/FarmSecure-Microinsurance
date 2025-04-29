import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';


const POLICY_SERVICE_BASE_URL = 'http://policy_service:8000';

@Injectable()
export class PoliciesService {
  constructor(private readonly httpService: HttpService) {}

  async createPolicy(payload: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${POLICY_SERVICE_BASE_URL}/policy`, payload)
    );
    return response.data;
  }

  async approvePolicy(policyId: number) {
    const response = await firstValueFrom(
      this.httpService.post(`${POLICY_SERVICE_BASE_URL}/policy/${policyId}/approve`)
    );
    return response.data;
  }

  async rejectPolicy(policyId: number) {
    const response = await firstValueFrom(
      this.httpService.post(`${POLICY_SERVICE_BASE_URL}/policy/${policyId}/reject`)
    );
    return response.data;
  }

  async getPolicy(policyId: number) {
    const response = await firstValueFrom(
      this.httpService.get(`${POLICY_SERVICE_BASE_URL}/policy/${policyId}`)
    );
    return response.data;
  }

  async getPolicyDetails(policyId: number) {
    const response = await firstValueFrom(
      this.httpService.get(`${POLICY_SERVICE_BASE_URL}/policy/${policyId}/details`)
    );
    return response.data;
  }

  async listPolicies() {
    const response = await firstValueFrom(
      this.httpService.get(`${POLICY_SERVICE_BASE_URL}/policies`)
    );
    return response.data;
  }

  async listPolicyDetails() {
    const response = await firstValueFrom(
      this.httpService.get(`${POLICY_SERVICE_BASE_URL}/policies/details`)
    );
    return response.data;
  }
}
