import { Transform, Type } from "class-transformer";
import { IsArray, IsDate, IsInt, IsOptional, IsString, Min } from "class-validator";

export class GetOrdersFilterDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit: number = 20;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map(item => item.trim());
        }
        return Array.isArray(value) ? value : [value];
    })
    county?: string[];

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    fromDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    toDate?: Date;
}