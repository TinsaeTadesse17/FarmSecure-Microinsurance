import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const DFS_SERVICE_BASE_URL = 'http://dfs_service:8000/api';

@Injectable()
export class DfsService {
  private readonly logger = new Logger(DfsService.name);

  constructor(private readonly httpService: HttpService) {}

  async createEnrollment(enrollmentRequest: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${DFS_SERVICE_BASE_URL}/enrollments/`, enrollmentRequest),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Error creating enrollment', error.stack);
      throw new HttpException(
        error.response?.data || 'Error creating enrollment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEnrollmentById(enrollment_id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${DFS_SERVICE_BASE_URL}/enrollments/${enrollment_id}`),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error fetching enrollment ${enrollment_id}`, error.stack);
      if (error.response?.status === HttpStatus.NOT_FOUND) {
        throw new HttpException('Enrollment not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.response?.data || 'Error fetching enrollment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEnrollmentByCompanyId(company_id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${DFS_SERVICE_BASE_URL}/enrollments/by-company/${company_id}`),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error fetching enrollment ${company_id}`, error.stack);
      if (error.response?.status === HttpStatus.NOT_FOUND) {
        throw new HttpException('Enrollment not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.response?.data || 'Error fetching enrollment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEnrollmentByUserId(user_id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${DFS_SERVICE_BASE_URL}/enrollments/by-user/${user_id}`),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error fetching enrollment ${user_id}`, error.stack);
      if (error.response?.status === HttpStatus.NOT_FOUND) {
        throw new HttpException('Enrollment not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.response?.data || 'Error fetching enrollment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async getAllEnrollments() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${DFS_SERVICE_BASE_URL}/enrollments/`),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Error fetching all enrollments', error.stack);
      throw new HttpException(
        error.response?.data || 'Error fetching all enrollments',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async approveEnrollment(enrollment_id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${DFS_SERVICE_BASE_URL}/enrollments/${enrollment_id}/approve`, {}),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error approving enrollment ${enrollment_id}`, error.stack);
      if (error.response?.status === HttpStatus.NOT_FOUND) {
        throw new HttpException('Enrollment not found for approval', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.response?.data || 'Error approving enrollment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async rejectEnrollment(enrollment_id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${DFS_SERVICE_BASE_URL}/enrollments/${enrollment_id}/reject`, {}),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error rejecting enrollment ${enrollment_id}`, error.stack);
      if (error.response?.status === HttpStatus.NOT_FOUND) {
        throw new HttpException('Enrollment not found for rejection', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.response?.data || 'Error rejecting enrollment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
