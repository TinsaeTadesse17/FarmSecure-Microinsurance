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
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

const USER_SERVICE_BASE_URL = 'http://user_service:8000/api/user';

@ApiTags('User')
@Controller('api/user')
export class UsersController {
  constructor(private readonly http: HttpService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user and return JWT access token' })
  @ApiResponse({ status: 201, description: 'Login successful, returns token' })
  @ApiResponse({ status: 401, description: 'Invalid username or password' })
  async login(@Body() body) {
    try {
      console.log("Logging in with body:", body);
      const res = await firstValueFrom(
        this.http.post(`${USER_SERVICE_BASE_URL}/login`, body),
      );
      console.log("Login response:", res.data);
      return res.data;
    } catch (err) {
      console.error("Login error:", err);
      throw new HttpException(err.response?.data || 'Login failed', err.response?.status || 500);
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Gets user data' })
  @ApiResponse({ status: 201, description: 'successful, returns data' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async getMe(@Headers('authorization') auth: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${USER_SERVICE_BASE_URL}/me`, {
          headers: { Authorization: auth },
        }),
      );
      return res.data;
    } catch (err) {
      throw new HttpException(err.response?.data || 'Auth error', err.response?.status || 500);
    }
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Updates info' })
  @ApiResponse({ status: 201, description: 'successful, returns updated data' })
  @ApiResponse({ status: 401, description: 'Invalid' })
  async updateUser(@Param('id') id: string, @Body() body, @Headers('authorization') auth: string) {
    try {
      const res = await firstValueFrom(
        this.http.put(`${USER_SERVICE_BASE_URL}/update/${id}`, body, {
          headers: { Authorization: auth },
        }),
      );
      return res.data;
    } catch (err) {
      throw new HttpException(err.response?.data || 'Update failed', err.response?.status || 500);
    }
  }

  @Post()
  @ApiOperation({ summary: 'User creation' })
  @ApiResponse({ status: 201, description: 'Creation successful, returns user' })
  @ApiResponse({ status: 401, description: 'creation failed' })
  async createUser(@Body() body, @Headers('authorization') auth: string) {
    try {
      const res = await firstValueFrom(
        this.http.post(`${USER_SERVICE_BASE_URL}`, body, {
          headers: { Authorization: auth },
        }),
      );
      return res.data;
    } catch (err) {
      throw new HttpException(err.response?.data || 'User creation failed', err.response?.status || 500);
    }
  }
}
