import { Module } from '@nestjs/common';
import { InventoryChecksService } from './inventory-checks.service';
import { InventoryChecksController } from './inventory-checks.controller';

@Module({
  controllers: [InventoryChecksController],
  providers: [InventoryChecksService],
})
export class InventoryChecksModule {}
