import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() userData: any) {
    return this.usersService.create(userData);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id/roles')
  async updateRoles(@Param('id') id: string, @Body() rolesData: any) {
    return this.usersService.updateRoles(+id, rolesData);
  }
}