
import { IncidentSeverityEnum } from '../models/enums/incident-severity.enum';
import { IncidentStatusEnum } from '../models/enums/incident-status.enum';

export type IncidentBaseType = {
  id: number;
  title: string;
  description?: string;
  service: string;
  severity: IncidentSeverityEnum;
  status: IncidentStatusEnum;
};
