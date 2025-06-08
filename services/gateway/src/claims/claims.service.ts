import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class ClaimsService {
  private readonly logger = new Logger(ClaimsService.name);
  private readonly baseUrl = process.env.CLAIM_SERVICE_URL || 'http://claim_service:8000';

  constructor(private readonly httpService: HttpService) {}

  private handleError(error: AxiosError, context: string) {
    this.logger.error(`${context}: ${error.message}`, error.stack);
    const status = error.response?.status || 500;
    const message = error.response?.data || `${context}`;
    throw new HttpException(message, status);
  }

  async createCrop(period: number): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/v1/claim/claims/crop?period=${period}`),
      );
      return data;
    } catch (err) {
      this.handleError(err as AxiosError, 'Error creating crop claims');
    }
  }

  async createLivestock(): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/v1/claim/claims/livestock`),
      );
      return data;
    } catch (err) {
      this.handleError(err as AxiosError, 'Error creating livestock claims');
    }
  }

  async triggerAll(): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/v1/claim/claims/trigger`),
      );
      return data;
    } catch (err) {
      this.handleError(err as AxiosError, 'Error triggering all claims');
    }
  }

  // Get claims grouped by customer
  async getByCustomer(): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/v1/claim/claims/by-customer`),
      );
      return data;
    } catch (err) {
      this.handleError(err as AxiosError, 'Error fetching claims by customer');
    }
  }

  // Get a specific claim by ID
  async getOne(claim_id: number): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/v1/claim/${claim_id}`),
      );
      return data;
    } catch (err) {
      this.handleError(err as AxiosError, `Error fetching claim ${claim_id}`);
    }
  }

  // Authorize a specific claim by ID
  async authorize(claim_id: number): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/api/v1/claim/${claim_id}/authorize`, {}),
      );
      return data;
    } catch (err) {
      this.handleError(err as AxiosError, `Error authorizing claim ${claim_id}`);
    }
  }

  // Get all claims
  async getAll(): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/v1/claim/`),
      );
      return data;
    } catch (err) {
      this.handleError(err as AxiosError, 'Error fetching all claims');
    }
  }

async getByCustomerByCompany(company_id: number) {
  try {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/api/v1/claim/claims/by-customer/${company_id}`)
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new HttpException('No claims found for the specified company', HttpStatus.NOT_FOUND);
    }
    throw new HttpException('Error retrieving claims by company', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

}