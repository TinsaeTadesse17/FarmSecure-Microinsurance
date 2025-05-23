import { Injectable, Logger, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
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

  async createCrop(period: number) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/v1/claim/claims/crop?period=${period}`),
      );
      return data;
    } catch (err) {
      this.handleError(err as AxiosError, 'Error creating crop claims');
    }
  }

  async createLivestock() {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/v1/claim/claims/livestock`),
      );
      return data;
    } catch (err) {
      this.handleError(err as AxiosError, 'Error creating livestock claims');
    }
  }

  async triggerAll() {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/v1/claim/claims/trigger`),
      );
      return data;
    } catch (err) {
      this.handleError(err as AxiosError, 'Error triggering all claims');
    }
  }

  async getByCustomer() {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/v1/claim/claims/by-customer`),
      );
      return data;
    } catch (err) {
      this.handleError(err as AxiosError, 'Error fetching claims by customer');
    }
  }

  async getOne(id: number) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/v1/claims/${id}`),
      );
      return data;
    } catch (err) {
      this.handleError(err as AxiosError, `Error fetching claim ${id}`);
    }
  }

  async authorize(id: number) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/api/v1/claims/${id}/authorize`, {}),
      );
      return data;
    } catch (err) {
      this.handleError(err as AxiosError, `Error authorizing claim ${id}`);
    }
  }
}