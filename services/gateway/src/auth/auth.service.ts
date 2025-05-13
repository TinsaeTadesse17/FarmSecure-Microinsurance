import { Injectable, UnauthorizedException, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { JwtPayload } from './jwt-payload.interface';
import { Role } from './constants/roles.enum';
import { ConfigService } from '@nestjs/config';
import { JwtAlgorithmPipe } from 'src/common/pipes/jwt-algorithm.pipe';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly algorithmPipe: JwtAlgorithmPipe,
  ) {}

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const algorithm = this.algorithmPipe.transform(
        this.configService.get<string>('JWT_ALGORITHM', 'HS256')
      );

      return this.jwtService.verify(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET_KEY'),
        algorithms: [algorithm],
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

