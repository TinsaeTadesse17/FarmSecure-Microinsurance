import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const POLICY_SERVICE_BASE_URL = 'http://policy_service:8000/api';

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);

  constructor(private readonly httpService: HttpService) {}

  async createPolicy(policyCreateSchema: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${POLICY_SERVICE_BASE_URL}/policy`, policyCreateSchema),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Error creating policy', error.stack);
      throw new HttpException(
        error.response?.data || 'Error creating policy',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async approvePolicy(policy_id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${POLICY_SERVICE_BASE_URL}/policy/${policy_id}/approve`, {}),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error approving policy ${policy_id}`, error.stack);
      throw new HttpException(
        error.response?.data || 'Error approving policy',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async rejectPolicy(policy_id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${POLICY_SERVICE_BASE_URL}/policy/${policy_id}/reject`, {}),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error rejecting policy ${policy_id}`, error.stack);
      throw new HttpException(
        error.response?.data || 'Error rejecting policy',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPolicy(policy_id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${POLICY_SERVICE_BASE_URL}/policy/${policy_id}`),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error fetching policy ${policy_id}`, error.stack);
      if (error.response?.status === HttpStatus.NOT_FOUND) {
        throw new HttpException('Policy not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.response?.data || 'Error fetching policy',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPolicyDetails(policy_id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${POLICY_SERVICE_BASE_URL}/policy/${policy_id}/details`),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error fetching policy details for ${policy_id}`, error.stack);
      if (error.response?.status === HttpStatus.NOT_FOUND) {
        throw new HttpException('Policy details not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.response?.data || 'Error fetching policy details',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllPolicies() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${POLICY_SERVICE_BASE_URL}/policies`),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Error fetching all policies', error.stack);
      throw new HttpException(
        error.response?.data || 'Error fetching all policies',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllPoliciesByCompany(company_id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${POLICY_SERVICE_BASE_URL}/policies/by-company/${company_id}`),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Error fetching all policies by company id', error.stack);
      throw new HttpException(
        error.response?.data || 'Error fetching all policies by company id',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllPoliciesByUser(user_id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${POLICY_SERVICE_BASE_URL}/policies/by-user/${user_id}`),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Error fetching all policies by user id', error.stack);
      throw new HttpException(
        error.response?.data || 'Error fetching all policies by user id',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllPoliciesByEnrollment(enrollment_id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${POLICY_SERVICE_BASE_URL}/policy/by-enrollment/${enrollment_id}`),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Error fetching all policies by enrollment id', error.stack);
      throw new HttpException(
        error.response?.data || 'Error fetching all policies by enrollment id',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllPolicyDetails() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${POLICY_SERVICE_BASE_URL}/policies/details`),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Error fetching all policy details', error.stack);
      throw new HttpException(
        error.response?.data || 'Error fetching all policy details',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
