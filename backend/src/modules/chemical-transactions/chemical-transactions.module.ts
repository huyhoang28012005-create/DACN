import { Module } from '@nestjs/common';
import { ChemicalTransactionsService } from './chemical-transactions.service';
import { ChemicalTransactionsController } from './chemical-transactions.controller';

@Module({
  controllers: [ChemicalTransactionsController],
  providers: [ChemicalTransactionsService],
})
export class ChemicalTransactionsModule {}
