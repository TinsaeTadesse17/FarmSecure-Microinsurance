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

const USER_SERVICE_BASE_URL = 'http://user_service:8000/api/user';

@Controller('api/user')
export class UsersController {
  constructor(private readonly http: HttpService) {}

  @Post('login')
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

  @Get('ics')
  async getIcUsers(@Headers('authorization') auth: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${USER_SERVICE_BASE_URL}/ics`, {
          headers: { Authorization: auth },
        }),
      );
      return res.data;
    } catch (err) {
      throw new HttpException(err.response?.data || 'Failed to fetch IC users', err.response?.status || 500);
    }
  }

  @Get('agents')
  async getAgentUsers(@Headers('authorization') auth: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${USER_SERVICE_BASE_URL}/agents`, {
          headers: { Authorization: auth },
        }),
      );
      return res.data;
    } catch (err) {
      throw new HttpException(err.response?.data || 'Failed to fetch agents', err.response?.status || 500);
    }
  }
}