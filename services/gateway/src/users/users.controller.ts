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

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async createUser(@Body() userCreate: any) {
    return this.usersService.createUser(userCreate);
  }

  @Post('agent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new agent user' })
  @ApiResponse({ status: 201, description: 'Agent user created successfully' })
  async createAgent(
    @Body() userCreate: any,
    @Headers('authorization') authHeader?: string, // Made optional to avoid breaking changes if not provided by client immediately
  ) {
    return this.usersService.createAgent(userCreate, authHeader);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current logged-in user' })
  @ApiResponse({ status: 200, description: 'Returns current user' })
  async getMe(@Req() req) {
    return this.usersService.getMe(req.user);
  }

  @Get('ics')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all IC users (admin only)' })
  @ApiResponse({ status: 200, description: 'Returns a list of IC users' })
  async getIcUsers(@Headers('authorization') authHeader?: string) { // Made optional
    return this.usersService.getIcUsers(authHeader);
  }

  @Put('update/:user_id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(
    @Param('user_id') userId: string,
    @Body() userUpdate: any,
    @Headers('authorization') authHeader?: string, // Made optional
  ) {
    return this.usersService.updateUser(userId, userUpdate, authHeader);
  }

  @Get('agents')
  @Roles(Role.IC)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all agents for the current IC user' })
  @ApiResponse({ status: 200, description: 'Returns a list of agents' })
  async getAgents(
    @Req() req,
    @Headers('authorization') authHeader?: string, // Made optional
  ) {
    return this.usersService.getAgents(req.user, authHeader);
  }
}
