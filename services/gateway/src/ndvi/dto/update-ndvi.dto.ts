import { PartialType } from '@nestjs/mapped-types';
import { CreateNdviDto } from './create-ndvi.dto';

export class UpdateNdviDto extends PartialType(CreateNdviDto) {}
