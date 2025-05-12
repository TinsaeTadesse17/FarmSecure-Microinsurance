import { Controller, Get, Post, Put, Param, Body, Query, HttpException, HttpStatus, UseGuards, Logger } from '@nestjs/common';
import { CompanyManagementService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { CredentialResponseDto } from './dto/credential-response.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/constants/roles.enum';

@ApiTags('Companies')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/companies')
export class CompanyManagementController {
  constructor(private readonly companyManagementService: CompanyManagementService) {}
  private readonly logger = new Logger(CompanyManagementController.name);

  @Public()
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

  @Roles(Role.IC, Role.Agent)
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

  @Roles(Role.Admin)
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

  @Roles(Role.Admin)
  @Put(':id/approve')
  @ApiOperation({ summary: 'Endpoint to approve a company' })
  @ApiResponse({ status: 201, description: 'Company approved successfully' })
  @ApiResponse({ status: 401, description: 'Invalid' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async approveCompany(@Param('id') id: number): Promise<CompanyResponseDto> {
    try {
      this.logger.debug(`Company ID to approve: ${id}`);
      return await this.companyManagementService.approveCompany(id);
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.NOT_FOUND);
    }
  }

  @Roles(Role.Admin)
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
