import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
}

}