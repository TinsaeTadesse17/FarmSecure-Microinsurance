import { Controller, Get, Post, Put, Param, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CompanyManagementService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { CredentialResponseDto } from './dto/credential-response.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@Controller('api/companies')
export class CompanyManagementController {
  constructor(private readonly companyManagementService: CompanyManagementService) {}

  // Endpoint to register a company.
  @Post('register')
  @ApiOperation({ summary: 'Endpoint to register a company' })
  @ApiResponse({ status: 201, description: 'Login successful, returns token' })
  @ApiResponse({ status: 401, description: 'Invalid username or password' })
  async createCompany(@Body() createCompanyDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    try {
      return await this.companyManagementService.createCompany(createCompanyDto);
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint to get a single company by ID.
  @Get(':id')
  @ApiOperation({ summary: 'Endpoint to get a single company by ID' })
  @ApiResponse({ status: 200, description: 'Returns a single company' })
  @ApiResponse({ status: 401, description: 'Invalid' })
  async getCompany(@Param('id') id: number): Promise<CompanyResponseDto> {
    try {
      return await this.companyManagementService.getCompany(id);
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.NOT_FOUND);
    }
  }

  // Endpoint to list companies.
  @Get()
  @ApiOperation({ summary: 'Endpoint to list companies' })
  @ApiResponse({ status: 200, description: 'Returns a list of companies' })
  @ApiResponse({ status: 401, description: 'Invalid' })
  async getCompanies(@Query('skip') skip = 0, @Query('limit') limit = 10): Promise<CompanyResponseDto[]> {
    try {
      return await this.companyManagementService.getCompanies(Number(skip), Number(limit));
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint to approve a company (only updates status to "approved")
  @Put(':id/approve')
  @ApiOperation({ summary: 'Endpoint to approve a company' })
  @ApiResponse({ status: 201, description: 'Company approved successfully' })
  @ApiResponse({ status: 401, description: 'Invalid' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async approveCompany(@Param('id') id: number): Promise<CompanyResponseDto> {
    try {
      return await this.companyManagementService.approveCompany(id);
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.NOT_FOUND);
    }
  }

  // Endpoint to generate credentials. It accepts a query parameter "role".
  @Post(':id/credentials')
  @ApiOperation({ summary: 'Endpoint to generate credentials. It accepts a query parameter "role"' })
  @ApiResponse({ status: 201, description: 'Login successful, returns credentials' })
  @ApiResponse({ status: 401, description: 'Invalid' })
  async generateCredentials(
    @Param('id') id: number,
    @Body('role') role: string
  ): Promise<CredentialResponseDto> {
    try {
      return await this.companyManagementService.generateCredentials(id, role);
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
