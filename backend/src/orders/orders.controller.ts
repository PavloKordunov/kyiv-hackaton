import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  Query,
  Body,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { GetOrdersFilterDto } from './dto/getOrdersFilterDto';
import { CreateManualOrderDto } from './dto/createManualOrderDto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('report/pdf')
  async downloadPdfReport(
    @Query() query: GetOrdersFilterDto,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer = await this.ordersService.generatePdfReport(query);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="wellness_kits_report_${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      });

      res.end(pdfBuffer);
    } catch (error) {
      console.error('Помилка генерації PDF:', error);
      throw new BadRequestException('Не вдалося згенерувати PDF звіт');
    }
  }

  @Get()
  async getOrders(@Query() query: GetOrdersFilterDto) {
    return this.ordersService.getOrders(query);
  }

  @Post()
  async createManualOrder(@Body() body: CreateManualOrderDto) {
    if (!body.lat || !body.lon || !body.subtotal) {
      throw new BadRequestException("Усі поля (lat, lon, subtotal) є обов'язковими");
    }
    return this.ordersService.createManualOrder(body);
  }

  @Get('heatmap')
  async getHeatmap() {
    return this.ordersService.getHeatmapData();
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не знайдено');
    }

    const result = await this.ordersService.importCsv(file.buffer);
    return result;
  }
}