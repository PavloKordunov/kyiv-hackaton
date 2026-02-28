import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateManualOrderDto {
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  lon: number;

  @IsNumber()
  @IsNotEmpty()
  subtotal: number;
}