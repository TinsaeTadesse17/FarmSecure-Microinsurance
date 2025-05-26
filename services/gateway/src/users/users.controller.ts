import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Req,
  Headers,
  HttpException,
  HttpStatus,
  Inject,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth//decorators/roles.decorator';
import { Role } from '../auth/constants/roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { Public } from 'src/auth/decorators/public.decorator';
import { UsersService } from './users.service';

@ApiTags('User')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user and return JWT access token' })
  @ApiResponse({ status: 201, description: 'Login successful, returns token' })
  @ApiResponse({ status: 401, description: 'Invalid username or password' })
  async login(@Body() loginRequest: any) {
    return this.usersService.login(loginRequest);
  }

  @Roles(Role.Admin)
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async createUser(
    @Body() userCreate: any,
    @Headers('authorization') authHeader?: string,
    ){
    return this.usersService.createUser(userCreate,authHeader);
  }

  @Roles(Role.IC)
  @Post('agent')
  async createAgent(
    @Body() agentDto: any,
    @Headers('authorization') authHeader?: string,  
    ){
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const token = authHeader.replace('Bearer ', '').trim();
    return this.usersService.createAgent(token, agentDto,authHeader);
  }

  @Roles(Role.Admin, Role.IC, Role.Agent)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current logged-in user' })
  @ApiResponse({ status: 200, description: 'Returns current user' })
  async getMe(@Req() req) {
    return this.usersService.getMe(req.user);
  }

  @Roles(Role.Admin)
  @Get('ics')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all IC users (admin only)' })
  @ApiResponse({ status: 200, description: 'Returns a list of IC users' })
  async getIcUsers(@Headers('authorization') authHeader?: string) { // Made optional
    return this.usersService.getIcUsers(authHeader);
  }

  @Roles(Role.Admin, Role.IC, Role.Agent)
  @Put('update/:user_id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(
    @Param('user_id') userId: string,
    @Body() userUpdate: any,
    @Headers('authorization') authHeader?: string,
  ){
    return this.usersService.updateUser(userId, userUpdate, authHeader);
  }

  @Roles(Role.IC)
  @Get('agents')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all agents for the current IC user' })
  @ApiResponse({ status: 200, description: 'Returns a list of agents' })
  async getAgents(
    @Headers('authorization') authHeader?: string, // Made optional
    ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    return this.usersService.getAgents(token,authHeader);
  }
}
