import { Module } from '@nestjs/common';
import { ChemicalLimitsController } from './chemical-limits.controller';
import { ChemicalLimitsService } from './chemical-limits.service';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChemicalLimitsController],
  providers: [ChemicalLimitsService],
  exports: [ChemicalLimitsService],
})
export class ChemicalLimitsModule {}
