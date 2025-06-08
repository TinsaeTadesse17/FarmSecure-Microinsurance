import { Controller, Post, Get, Param, Query, Put, HttpException, HttpStatus, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClaimsService } from './claims.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/constants/roles.enum';

@ApiTags('Claims')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/claim')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Roles(Role.Admin)
  @Post('/claims/crop')
  @ApiOperation({ summary: 'Trigger crop claims for a given period' })
  @ApiResponse({ status: 200, description: 'Claims are being processed.' })
  async createCrop(@Query('period', ParseIntPipe) period: number) {
    if (isNaN(period)) {
      throw new HttpException('Invalid period', HttpStatus.BAD_REQUEST);
    }
    return this.claimsService.createCrop(period);
  }

  @Roles(Role.Admin)
  @Post('/claims/livestock')
  @ApiOperation({ summary: 'Trigger livestock claims' })
  @ApiResponse({ status: 200, description: 'Claims are being processed.' })
  async createLivestock() {
    return this.claimsService.createLivestock();
  }

  @Roles(Role.Admin)
  @Post('/claims/trigger')
  @ApiOperation({ summary: 'Trigger all claims processing' })
  @ApiResponse({ status: 200, description: 'Background processing started.' })
  async triggerAll() {
    return this.claimsService.triggerAll();
  }

  @Roles(Role.IC, Role.Admin)
  @Get('/claims/by-customer')
  @ApiOperation({ summary: 'Get claims grouped by customer' })
  @ApiResponse({ status: 200, description: 'List of customer claim summaries' })
  async getByCustomer() {
    return this.claimsService.getByCustomer();
  }

  @Roles(Role.IC, Role.Admin)
  @Get(':id')
  @ApiOperation({ summary: 'Get a single claim by ID' })
  @ApiResponse({ status: 200, description: 'Claim details' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async getOne(@Param('claim_id', ParseIntPipe) claim_id: number) {
    if (isNaN(claim_id)) {
      throw new HttpException('Invalid claim ID', HttpStatus.BAD_REQUEST);
    }
    return this.claimsService.getOne(claim_id);
  }

  @Roles(Role.IC, Role.Admin)
  @Get()
  @ApiOperation({ summary: 'Get all claims' })
  @ApiResponse({ status: 200, description: 'Claims detail' })
  @ApiResponse({ status: 404, description: 'Claims not found' })
  async getAll() {
    return this.claimsService.getAll();
  }

  @Roles(Role.Admin)
  @Put('/:claim_id/authorize')
  @ApiOperation({ summary: 'Authorize a claim' })
  @ApiResponse({ status: 200, description: 'Claim authorized' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async authorize(@Param('claim_id', ParseIntPipe) claim_id: number) {
    if (isNaN(claim_id)) {
      throw new HttpException('Invalid claim ID', HttpStatus.BAD_REQUEST);
    }
    return this.claimsService.authorize(claim_id);
  }

  @Roles(Role.IC, Role.Agent)
@Get('/claims/by-customer/:company_id')
@ApiOperation({ summary: 'Get claims grouped by customer for a specific company' })
@ApiResponse({ status: 200, description: 'List of customer claim summaries for the given company' })
@ApiResponse({ status: 404, description: 'No claims found for this company' })
async getByCustomerByCompany(@Param('company_id', ParseIntPipe) company_id: number) {
  if (isNaN(company_id)) {
    throw new HttpException('Invalid company ID', HttpStatus.BAD_REQUEST);
  }
  return this.claimsService.getByCustomerByCompany(company_id);
}

}