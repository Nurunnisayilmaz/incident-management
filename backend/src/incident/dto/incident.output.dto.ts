import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { IncidentSeverityEnum } from '../models/enums/incident-severity.enum';
import { IncidentBaseType } from '../types/incident.base.type';
import { IncidentStatusEnum } from '../models/enums/incident-status.enum';
import { IncidentServiceEnum } from '../models/enums/incident-service.enum';

export class IncidentOutputDto implements IncidentBaseType {

  @IsInt()
  id!: number;

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

  @IsNotEmpty()
  @IsEnum(IncidentStatusEnum)
  status!: IncidentStatusEnum;

}