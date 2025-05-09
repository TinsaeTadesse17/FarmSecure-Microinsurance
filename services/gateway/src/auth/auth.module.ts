// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtAlgorithmPipe } from 'src/common/pipes/jwt-algorithm.pipe';

@Module({
  imports: [
    // Import ConfigModule to make ConfigService available
    ConfigModule.forRoot(), // This is crucial
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
        signOptions: {
          algorithm: config.get('JWT_ALGORITHM', 'HS256'),
          expiresIn: config.get('JWT_EXPIRY_MINUTES', '60') + 'm',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtAlgorithmPipe, // Make sure the pipe is provided
  ],
  exports: [AuthService],
})
export class AuthModule {}