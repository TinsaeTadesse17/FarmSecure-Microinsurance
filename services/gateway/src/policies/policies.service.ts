import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const POLICY_SERVICE_BASE_URL = 'http://policy_service:8000/api';

@Injectable()
export class PoliciesService {
  constructor(private readonly httpService: HttpService) {}

  async createPolicy(payload: { enrollment_id: number }) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${POLICY_SERVICE_BASE_URL}/policy`,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );
    return response.data;
  }

  async approvePolicy(policyId: number) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${POLICY_SERVICE_BASE_URL}/policy/${policyId}/approve`,
        {}, // Empty body, FastAPI expects a POST not a GET
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );
    return response.data;
  }

  async rejectPolicy(policyId: number) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${POLICY_SERVICE_BASE_URL}/policy/${policyId}/reject`,
        {}, // Empty body
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
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
