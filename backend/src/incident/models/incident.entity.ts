import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { IncidentBaseType } from '../types/incident.base.type';
import { IncidentSeverityEnum } from './enums/incident-severity.enum';
import { IncidentStatusEnum } from './enums/incident-status.enum';
import { IncidentServiceEnum } from './enums/incident-service.enum';

@Entity('incidents')
export class Incident implements IncidentBaseType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  title!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: IncidentServiceEnum,
  })
  service!: IncidentServiceEnum;

  @Column({
    type: 'enum',
    enum: IncidentSeverityEnum,
  })
  severity!: IncidentSeverityEnum;

  @Column({
    type: 'enum',
    enum: IncidentStatusEnum,
    default: IncidentStatusEnum.OPEN,
  })
  status!: IncidentStatusEnum;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}