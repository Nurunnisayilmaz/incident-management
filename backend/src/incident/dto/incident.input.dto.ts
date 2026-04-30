import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IncidentSeverityEnum } from '../models/enums/incident-severity.enum';

export class IncidentInputDto {

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsString()
  service!: string;

  @IsNotEmpty()
  @IsEnum(IncidentSeverityEnum)
  severity!: IncidentSeverityEnum;

}