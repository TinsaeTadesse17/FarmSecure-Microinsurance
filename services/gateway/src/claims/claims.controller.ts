import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Put,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClaimsService } from './claims.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/constants/roles.enum';

@ApiTags('Claims')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Roles(Role.IC, Role.Agent, Role.Admin)
  @Post('crop')
  @ApiOperation({ summary: 'Trigger crop claims for a given period' })
  @ApiResponse({ status: 200, description: 'Claims are being processed.' })
  async createCrop(@Query('period') period: string) {
    const p = parseInt(period, 10);
    if (isNaN(p)) {
      throw new HttpException('Invalid period', HttpStatus.BAD_REQUEST);
    }
    return this.claimsService.createCrop(p);
  }

  @Roles(Role.IC, Role.Agent, Role.Admin)
  @Post('livestock')
  @ApiOperation({ summary: 'Trigger livestock claims' })
  @ApiResponse({ status: 200, description: 'Claims are being processed.' })
  async createLivestock() {
    return this.claimsService.createLivestock();
  }

  @Roles(Role.IC, Role.Agent, Role.Admin)
  @Post('trigger')
  @ApiOperation({ summary: 'Trigger all claims processing' })
  @ApiResponse({ status: 200, description: 'Background processing started.' })
  async triggerAll() {
    return this.claimsService.triggerAll();
  }

  @Roles(Role.IC, Role.Agent, Role.Admin)
  @Get('by-customer')
  @ApiOperation({ summary: 'Get claims grouped by customer' })
  @ApiResponse({ status: 200, description: 'List of customer claim summaries' })
  async getByCustomer() {
    return this.claimsService.getByCustomer();
  }

  @Roles(Role.IC, Role.Agent, Role.Admin)
  @Get(':id')
  @ApiOperation({ summary: 'Get a single claim by ID' })
  @ApiResponse({ status: 200, description: 'Claim details' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async getOne(@Param('id') id: string) {
    const claimId = parseInt(id, 10);
    if (isNaN(claimId)) {
      throw new HttpException('Invalid claim ID', HttpStatus.BAD_REQUEST);
    }
    return this.claimsService.getOne(claimId);
  }

  @Roles(Role.IC, Role.Agent, Role.Admin)
  @Put(':id/authorize')
  @ApiOperation({ summary: 'Authorize a claim' })
  @ApiResponse({ status: 200, description: 'Claim authorized' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async authorize(@Param('id') id: string) {
    const claimId = parseInt(id, 10);
    if (isNaN(claimId)) {
      throw new HttpException('Invalid claim ID', HttpStatus.BAD_REQUEST);
    }
    return this.claimsService.authorize(claimId);
  }
}
