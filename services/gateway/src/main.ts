import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const reflector = app.get(Reflector);
  const guard = app.get(ThrottlerGuard);
  app.useGlobalGuards(guard);

  await app.listen(3000);
}
bootstrap();
