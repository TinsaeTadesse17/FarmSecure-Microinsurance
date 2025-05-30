import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Express } from 'express';
import FormData from 'form-data';

const PRODUCT_SERVICE_BASE_URL = 'http://product_service:8000/api';

@Injectable()
export class ProductsService {
  constructor(private readonly httpService: HttpService) {}

  async findAll(skip: number, limit: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${PRODUCT_SERVICE_BASE_URL}/products?skip=${skip}&limit=${limit}`),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Error fetching products',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(product_id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${PRODUCT_SERVICE_BASE_URL}/products/${product_id}`),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Product not found',
        error.response?.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  async findAllByCompanyId(company_id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${PRODUCT_SERVICE_BASE_URL}/products/by-company/${company_id}`),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Product not found',
        error.response?.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  async create(productCreateDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${PRODUCT_SERVICE_BASE_URL}/products`, productCreateDto),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Error creating product',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(product_id: string, productUpdateDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${PRODUCT_SERVICE_BASE_URL}/products/${product_id}`, productUpdateDto),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Error updating product',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async calculatePremium(product_id: string, zone_id: string, fiscal_year: string, period_id: string, growing_season_id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${PRODUCT_SERVICE_BASE_URL}/products/${product_id}/calculate-premium?zone_id=${zone_id}&fiscal_year=${fiscal_year}&period_id=${period_id}&growing_season_id=${growing_season_id}`),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Error calculating premium',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadExcel(file: Express.Multer.File, growing_season_id: string, force: boolean) {
    try {
      const formData = new FormData();
      formData.append('file', file.buffer, file.originalname);
      const response = await firstValueFrom(
        this.httpService.post(`${PRODUCT_SERVICE_BASE_URL}/excel/upload_excel?growing_season_id=${growing_season_id}&force=${force}`, formData, {
          headers: {
            ...formData.getHeaders(),
          },
        }),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Error uploading excel file',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadNdvi(file: Express.Multer.File, period: string, ndvi_type: string) {
    try {
      const formData = new FormData();
      formData.append('file', file.buffer, file.originalname);
      const response = await firstValueFrom(
        this.httpService.post(`${PRODUCT_SERVICE_BASE_URL}/upload_ndvi?period=${period}&ndvi_type=${ndvi_type}`, formData, {
          headers: {
            ...formData.getHeaders(),
          },
        }),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Error uploading NDVI data',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
