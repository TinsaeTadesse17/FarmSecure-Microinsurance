import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { Express } from 'express';
import * as FormData from 'form-data';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private readonly baseUrl =
    process.env.CONFIG_SERVICE_URL ?? 'http://config_service:8000';

  constructor(private readonly httpService: HttpService) {}

  private handleError(error: AxiosError, context: string): never {
    this.logger.error(`${context}: ${error.message}`, error.stack);
    const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      error.response?.data ?? `${context} failed unexpectedly`;
    throw new HttpException(message, status);
  }

  // Upload CPS Zone files
  async uploadCpsZone(
    trigger: Express.Multer.File,
    exit: Express.Multer.File,
    season: Express.Multer.File,
  ): Promise<any> {
    try {
      this.logger.log(
        `uploadCpsZone: forwarding files [${trigger.originalname}, ${exit.originalname}, ${season.originalname}]`,
      );

      const form = new FormData();
      form.append('trigger_points_file', trigger.buffer, trigger.originalname);
      form.append('exit_points_file', exit.buffer, exit.originalname);
      form.append('growing_seasons_file', season.buffer, season.originalname);

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/api/v1/cps-zone/upload-set`,
          form,
          { headers: form.getHeaders() },
        ),
      );

      return response.data;
    } catch (err: unknown) {
      this.handleError(err as AxiosError, 'Error uploading CPS Zone files');
    }
  }

  // Get CPS Zone Period Config
  async getCpsZonePeriodConfig(
    cps_zone_value: number,
    period_value: number,
  ): Promise<any> {
    try {
      this.logger.log(`getCpsZonePeriodConfig: zone=${cps_zone_value}, period=${period_value}`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/api/v1/cps-zone/${cps_zone_value}/${period_value}`,
        ),
      );
      return response.data;
    } catch (err: unknown) {
      this.handleError(
        err as AxiosError,
        `Error fetching CPS Zone config for zone=${cps_zone_value}, period=${period_value}`,
      );
    }
  }

  // Get all periods for a CPS Zone
  async getAllPeriodsForCpsZone(cps_zone_value: number): Promise<any> {
    try {
      this.logger.log(`getAllPeriodsForCpsZone: zone=${cps_zone_value}`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/api/v1/cps-zone/zone/${cps_zone_value}`,
        ),
      );
      return response.data;
    } catch (err: unknown) {
      this.handleError(
        err as AxiosError,
        `Error fetching all periods for CPS Zone=${cps_zone_value}`,
      );
    }
  }

  // Get growing season for a specific grid
  async getGrowingSeasonForGrid(grid_value: number): Promise<any> {
    try {
      this.logger.log(`getGrowingSeasonForGrid: grid=${grid_value}`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/api/v1/cps-zone/growing_season/${grid_value}`,
        ),
      );
      return response.data;
    } catch (err: unknown) {
      this.handleError(
        err as AxiosError,
        `Error fetching growing season for grid=${grid_value}`,
      );
    }
  }

  // Check if a period is within the growing season for a grid
  async checkPeriodInGrowingSeasonForGrid(
    grid_value: number,
    period: number,
  ): Promise<any> {
    try {
      this.logger.log(
        `checkPeriodInGrowingSeasonForGrid: grid=${grid_value}, period=${period}`,
      );
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/api/v1/cps-zone/growing_season/${grid_value}/${period}`,
        ),
      );
      return response.data;
    } catch (err: unknown) {
      this.handleError(
        err as AxiosError,
        `Error checking period=${period} in growing season for grid=${grid_value}`,
      );
    }
  }

  async getUploadedCpsFiles(): Promise<any> {
    try {
      this.logger.log('listUploadedCpsFiles');
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/v1/cps-zone/files/`),
      );
      return response.data;
    } catch (err: unknown) {
      this.handleError(err as AxiosError, 'Error listing CPS Zone files');
    }
  }

  async getUploadedCpsFile(filename: string): Promise<any> {
    try {
      this.logger.log(`getUploadedCpsFile: filename=${filename}`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/api/v1/cps-zone/files/${encodeURIComponent(filename)}`,
          { responseType: 'stream' },
        ),
      );
      return response.data;
    } catch (err: unknown) {
      this.handleError(
        err as AxiosError,
        `Error fetching CPS Zone file ${filename}`,
      );
    }
  }

  async uploadNdviFile(file: Express.Multer.File): Promise<any> {
    try {
      this.logger.log(`uploadNdviFile: forwarding ${file.originalname}`);
      const form = new FormData();
      form.append('file', file.buffer, file.originalname);

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/api/v1/ndvi/upload`,
          form,
          { headers: form.getHeaders() },
        ),
      );

      return response.data;
    } catch (err: unknown) {
      this.handleError(err as AxiosError, 'Error uploading NDVI file');
    }
  }

  async getNdviUploadStatus(jobId: string): Promise<any> {
    try {
      this.logger.log(`getNdviUploadStatus: jobId=${jobId}`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/api/v1/ndvi/upload/status/${jobId}`,
        ),
      );
      return response.data;
    } catch (err: unknown) {
      this.handleError(
        err as AxiosError,
        `Error fetching NDVI upload status for job ${jobId}`,
      );
    }
  }

  async getNdvi(gridId: number, periodId: number): Promise<any> {
    try {
      this.logger.log(`getNdvi: grid=${gridId}, period=${periodId}`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/api/v1/ndvi/${gridId}/${periodId}`,
        ),
      );
      return response.data;
    } catch (err: unknown) {
      this.handleError(
        err as AxiosError,
        `Error fetching NDVI for grid=${gridId}, period=${periodId}`,
      );
    }
  }


  async getNdviForGrid(gridId: number): Promise<any> {
    try {
      this.logger.log(`getNdviForGrid: grid=${gridId}`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/v1/ndvi/${gridId}`),
      );
      return response.data;
    } catch (err: unknown) {
      this.handleError(
        err as AxiosError,
        `Error fetching NDVI entries for grid=${gridId}`,
      );
    }
  }

  async getAllNdviData(skip = 0, limit = 1000): Promise<any> {
    try {
      this.logger.log(`getAllNdviData: skip=${skip}, limit=${limit}`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/v1/ndvi`, {
          params: { skip, limit },
        }),
      );
      return response.data;
    } catch (err: unknown) {
      this.handleError(
        err as AxiosError,
        `Error fetching NDVI data (skip=${skip}, limit=${limit})`,
      );
    }
  }

  async getUploadedNdviFiles(): Promise<any> {
    try {
      this.logger.log('getUploadedNdviFiles');
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/v1/ndvi/files`),
      );
      return response.data;
    } catch (err: unknown) {
      this.handleError(err as AxiosError, 'Error listing NDVI files');
    }
  }

  async getUploadedNdviFile(filename: string): Promise<any> {
    try {
      this.logger.log(`getUploadedNdviFile: filename=${filename}`);
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/api/v1/ndvi/files/${encodeURIComponent(filename)}`,
          { responseType: 'stream' },
        ),
      );
      return response.data;
    } catch (err: unknown) {
      this.handleError(
        err as AxiosError,
        `Error fetching NDVI file ${filename}`,
      );
    }
  }
}
