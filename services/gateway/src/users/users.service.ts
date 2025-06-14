import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const USER_SERVICE_BASE_URL = 'http://user_service:8000/api/user';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly httpService: HttpService) {}

  async login(loginRequest: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${USER_SERVICE_BASE_URL}/login`, loginRequest),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Login failed', error.stack);
      throw new HttpException(
        error.response?.data || 'Login failed',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createUser(userCreate: any, authHeader?: string) {
    try {
      const headers = authHeader ? { Authorization: authHeader } : {};
      const response = await firstValueFrom(
        this.httpService.post(`${USER_SERVICE_BASE_URL}/`, userCreate, {
          headers: {
            Authorization: authHeader,
          },
        }),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('User creation failed', error.stack);
      throw new HttpException(
        error.response?.data || 'User creation failed',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

async createAgent(token: string, agentData: any, authHeader?: string) {
    try {
      const headers = authHeader ? { Authorization: authHeader } : {};
      const response = await firstValueFrom(
        this.httpService.post(`${USER_SERVICE_BASE_URL}/agent`, agentData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to create agent', error.stack);
      throw new HttpException(
        error.response?.data || 'Failed to create agent',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMe(user: any) {
    // The user object is already available from the JwtAuthGuard
    return user;
  }

  async getIcUsers(authHeader?: string) {
    try {
      const headers = authHeader ? { Authorization: authHeader } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${USER_SERVICE_BASE_URL}/ics`, { headers }),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to fetch IC users', error.stack);
      throw new HttpException(
        error.response?.data || 'Failed to fetch IC users',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(userId: string, userUpdate: any, authHeader?: string) {
    try {
      const headers = authHeader ? { Authorization: authHeader } : {};
      const response = await firstValueFrom(
        this.httpService.put(
          `${USER_SERVICE_BASE_URL}/update/${userId}`,
          userUpdate,
          { headers },
        ),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to update user ${userId}`, error.stack);
      throw new HttpException(
        error.response?.data || 'Failed to update user',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

async getAgents(authToken: string, authHeader?: string) {
    try {
      const headers = authHeader ? { Authorization: authHeader } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${USER_SERVICE_BASE_URL}/agents`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to fetch agents', error?.message || error);
      throw new HttpException(
        error?.response?.data || 'Failed to fetch agents',
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
