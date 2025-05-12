import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Algorithm } from 'jsonwebtoken';

const VALID_ALGORITHMS: Algorithm[] = [
  'HS256', 'HS384', 'HS512',
  'RS256', 'RS384', 'RS512',
  'ES256', 'ES384', 'ES512',
  'PS256', 'PS384', 'PS512',
  'none'
];

@Injectable()
export class JwtAlgorithmPipe implements PipeTransform<string, Algorithm> {
  transform(value: string): Algorithm {
    if (!VALID_ALGORITHMS.includes(value as Algorithm)) {
      throw new BadRequestException(`Invalid JWT algorithm: ${value}`);
    }
    return value as Algorithm;
  }
}