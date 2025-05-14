import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly baseUrl = process.env.USER_SERVICE_URL || 'http://user_service:8000';

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

  async findByEmail(email: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/users/email/${email}`)
      );
      return data;
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return null;
      }
      this.handleAxiosError(error, `Error finding user by email ${email}`);
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
    
    if (error.response?.status === 404) {
      throw new NotFoundException(error.response?.data || 'User not found');
    }
    
    throw error;
  }
}