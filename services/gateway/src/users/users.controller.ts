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

@Controller('api/user')
export class UsersController {
  constructor(private readonly http: HttpService) {}

  @Post('login')
  async login(@Body() body) {
    try {
      const res = await firstValueFrom(
        this.http.post('http://localhost:8003/api/user/login', body),
      );
      return res.data;
    } catch (err) {
      throw new HttpException(err.response?.data || 'Login failed', err.response?.status || 500);
    }
  }

  @Get('me')
  async getMe(@Headers('authorization') auth: string) {
    try {
      const res = await firstValueFrom(
        this.http.get('http://localhost:8003/api/user/me', {
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
        this.http.put(`http://localhost:8003/api/user/update/${id}`, body, {
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
        this.http.post(`http://localhost:8003/api/user/`, body, {
          headers: { Authorization: auth },
        }),
      );
      return res.data;
    } catch (err) {
      throw new HttpException(err.response?.data || 'User creation failed', err.response?.status || 500);
    }
  }
}
