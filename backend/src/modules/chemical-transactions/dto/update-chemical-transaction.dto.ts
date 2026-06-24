import { PartialType } from '@nestjs/mapped-types';
import { CreateChemicalTransactionDto } from './create-chemical-transaction.dto';

export class UpdateChemicalTransactionDto extends PartialType(CreateChemicalTransactionDto) {}
