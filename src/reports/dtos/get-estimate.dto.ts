import {
  IsString,
  isNumber,
  Min,
  Max,
  IsLatitude,
  IsLongitude,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GetEstimateDto {
  @IsString()
  make: string;

  @IsString()
  model: string;

  @Transform(({ value }) => parseInt(value)) //Bc query is a string
  @IsNumber()
  @Min(1930)
  @Max(2050)
  year: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  @Max(1000000)
  mileage: number;

  @Transform(({ value }) => parseFloat(value))
  @IsLongitude()
  lng: number;

  @Transform(({ value }) => parseFloat(value))
  @IsLatitude()
  lat: number;

  //We don't need a price property because thats what we are trying to estimate
  //   @IsNumber()
  //   @Min(0)
  //   @Max(1000000)
  //   price: number;
}
