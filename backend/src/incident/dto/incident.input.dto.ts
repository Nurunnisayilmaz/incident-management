import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IncidentServiceEnum } from '../models/enums/incident-service.enum';
import { IncidentSeverityEnum } from '../models/enums/incident-severity.enum';

export class IncidentInputDto {

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsEnum(IncidentServiceEnum)
  service!: IncidentServiceEnum;

  @IsNotEmpty()
  @IsEnum(IncidentSeverityEnum)
  severity!: IncidentSeverityEnum;

}