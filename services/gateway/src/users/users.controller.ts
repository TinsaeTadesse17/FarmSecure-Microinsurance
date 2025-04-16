import { Controller, Post, Body, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin')
  async createUser(@Body() userData: any) {
    return this.usersService.create(userData);
  }

  @Get(':id')
  @Roles('admin', 'agent', 'IC')
  async getUser(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id/roles')
  @Roles('admin')
  async updateRoles(@Param('id') id: string, @Body() rolesData: any) {
    return this.usersService.updateRoles(+id, rolesData);
  }
}