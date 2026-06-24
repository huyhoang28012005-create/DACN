import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryCheckDto } from './create-inventory-check.dto';

export class UpdateInventoryCheckDto extends PartialType(CreateInventoryCheckDto) {}
