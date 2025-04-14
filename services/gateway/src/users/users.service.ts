import { Injectable, Logger, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly baseUrl = process.env.USER_SERVICE_URL || 'http://user_service:9000';

  constructor(private readonly httpService: HttpService) {}

  async create(userData: any) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/users`, userData)
      );
      return data;
    } catch (error) {
      this.handleAxiosError(error, 'Error creating user');
    }
  }

  async findOne(id: number) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/users/${id}`)
      );
      return data;
    } catch (error) {
      this.handleAxiosError(error, `Error fetching user ${id}`);
    }
  }

  async updateRoles(id: number, rolesData: any) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/api/users/${id}/roles`, rolesData)
      );
      return data;
    } catch (error) {
      this.handleAxiosError(error, `Error updating roles for user ${id}`);
    }
  }

  private handleAxiosError(error: AxiosError, context: string) {
    this.logger.error(`${context}: ${error.message}`, error.stack);
    throw new HttpException(
      error.response?.data || context,
      error.response?.status || 500
    );
  }
}