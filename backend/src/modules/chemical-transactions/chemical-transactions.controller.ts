import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ChemicalTransactionsService } from './chemical-transactions.service';
import { CreateChemicalTransactionDto } from './dto/create-chemical-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../auth/interfaces/user-payload.interface';

@Controller('chemical-transactions')
@UseGuards(JwtAuthGuard)
export class ChemicalTransactionsController {
  constructor(private readonly chemicalTransactionsService: ChemicalTransactionsService) {}

  @Post()
  create(
    @CurrentUser() user: UserPayload,
    @Body() createChemicalTransactionDto: CreateChemicalTransactionDto,
  ) {
    return this.chemicalTransactionsService.create(user.userId, createChemicalTransactionDto);
  }

  @Get()
  findAll(@Query('chemicalId') chemicalId?: string) {
    return this.chemicalTransactionsService.findAll(chemicalId ? parseInt(chemicalId) : undefined);
  }
}
