import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [OrdersService, DatabaseService],
  controllers: [OrdersController],
})
export class OrdersModule {}
