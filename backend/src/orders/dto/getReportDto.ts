import { IsOptional, IsString } from 'class-validator';

export class GetReportDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  county?: string;
}