import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly baseUrl = process.env.USER_SERVICE_URL || 'http://user_service:9000';

  constructor(private readonly httpService: HttpService) {}

  async create(userData: any): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/users`, userData)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/users/${id}`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching user ${id}: ${error.message}`);
      throw error;
    }
  }

  async updateRoles(id: number, rolesData: any): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/api/users/${id}/roles`, rolesData)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error updating roles for user ${id}: ${error.message}`);
      throw error;
    }
  }
}