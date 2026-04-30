
import { IncidentService } from '../models/enums/incident-service.enum';
import { IncidentSeverity } from '../models/enums/incident-severity.enum';
import { IncidentStatus } from '../models/enums/incident-status.enum';
import { PaginatedBaseType } from './pagination.base.type';

export type IncidentBaseType = {
  id: number;
  title: string;
  description?: string;
  service: IncidentService;
  severity: IncidentSeverity;
  status: IncidentStatus;
};

export type PaginatedIncidentBaseType = PaginatedBaseType<IncidentBaseType>;