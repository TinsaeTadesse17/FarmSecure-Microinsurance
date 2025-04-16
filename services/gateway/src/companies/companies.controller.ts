// src/company-management/company-management.controller.ts
import { Controller, Get, Post, Put, Param, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CompanyManagementService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { CredentialResponseDto } from './dto/credential-response.dto';

@Controller('companies')
export class CompanyManagementController {
  constructor(private readonly companyManagementService: CompanyManagementService) {}

  // Endpoint to register a company.
  @Post('register')
  async createCompany(@Body() createCompanyDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    try {
      return await this.companyManagementService.createCompany(createCompanyDto);
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint to get a single company by ID.
  @Get(':id')
  async getCompany(@Param('id') id: number): Promise<CompanyResponseDto> {
    try {
      return await this.companyManagementService.getCompany(id);
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.NOT_FOUND);
    }
  }

  // Endpoint to list companies.
  @Get()
  async getCompanies(@Query('skip') skip = 0, @Query('limit') limit = 10): Promise<CompanyResponseDto[]> {
    try {
      return await this.companyManagementService.getCompanies(Number(skip), Number(limit));
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint to approve a company (only updates status to "approved")
  @Put(':id/approve')
  async approveCompany(@Param('id') id: number): Promise<CompanyResponseDto> {
    try {
      return await this.companyManagementService.approveCompany(id);
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.NOT_FOUND);
    }
  }

  // Endpoint to generate credentials. It accepts a query parameter "role".
  @Post(':id/credentials')
  async generateCredentials(
    @Param('id') id: number,
    @Query('role') role: string
  ): Promise<CredentialResponseDto> {
    try {
      return await this.companyManagementService.generateCredentials(id, role);
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
