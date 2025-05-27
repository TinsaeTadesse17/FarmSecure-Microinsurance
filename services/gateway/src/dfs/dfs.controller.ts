import { Controller, Get, Post, Put, Param, Body, Query, HttpException, HttpStatus, UseGuards, Logger } from '@nestjs/common';
import { DfsService } from './dfs.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/constants/roles.enum';

@ApiTags('DFS')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/enrollments')
@ApiBearerAuth('access-token')
export class DfsController {
  constructor(private readonly dfsService: DfsService) {}

  @Roles(Role.Agent)
  @Post('/')
  @ApiOperation({ summary: 'Create an enrollment' })
  @ApiResponse({ status: 201, description: 'Enrollment created successfully' })
  async createEnrollment(@Body() enrollmentRequest: any) {
    return this.dfsService.createEnrollment(enrollmentRequest);
  }

  @Roles(Role.Agent, Role.IC)
  @Get('/:enrollment_id')
  @ApiOperation({ summary: 'Get an enrollment by ID' })
  @ApiResponse({ status: 200, description: 'Returns a single enrollment' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async getEnrollmentById(@Param('enrollment_id') enrollment_id: string) {
    return this.dfsService.getEnrollmentById(enrollment_id);
  }

  @Get('/')
  @Roles(Role.IC, Role.Agent) // Assuming IC and Admin can list all
  @ApiOperation({ summary: 'List all enrollments' })
  @ApiResponse({ status: 200, description: 'Returns a list of enrollments' })
  async getAllEnrollments() {
    return this.dfsService.getAllEnrollments();
  }

  @Roles(Role.IC, Role.Agent)
  @Put('/:enrollment_id/approve')
  @ApiOperation({ summary: 'Approve an enrollment' })
  @ApiResponse({ status: 200, description: 'Enrollment approved successfully' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async approveEnrollment(@Param('enrollment_id') enrollment_id: string) {
    return this.dfsService.approveEnrollment(enrollment_id);
  }

  @Roles(Role.Agent,Role.IC)
  @Put('/:enrollment_id/reject')
  @ApiOperation({ summary: 'Reject an enrollment' })
  @ApiResponse({ status: 200, description: 'Enrollment rejected successfully' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async rejectEnrollment(@Param('enrollment_id') enrollment_id: string) {
    return this.dfsService.rejectEnrollment(enrollment_id);
  }
}
