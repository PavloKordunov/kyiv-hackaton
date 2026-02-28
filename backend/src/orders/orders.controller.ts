import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не знайдено');
    }

    const result = await this.ordersService.importCsv(file.buffer);
    return result;
  }

  @Get('taxes')
  async getChartData(){
    return await this.ordersService.GetChartData()
  }

  @Get('stats')
  async getStats(){
    return await this.ordersService.getDashBordStats()
  }
}
