import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { IncidentBaseType } from '../types/incident.base.type';
import { IncidentSeverityEnum } from './enums/incident-severity.enum';
import { IncidentStatusEnum } from './enums/incident-status.enum';

@Entity('incidents')
export class Incident implements IncidentBaseType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  title!: string;

  @Column('text')
  description!: string;

  @Column()
  service!: string;

  @Column({
    type: 'enum',
    enum: IncidentSeverityEnum,
  })
  severity!: IncidentSeverityEnum;

  @Index()
  @Column({
    type: 'enum',
    enum: IncidentStatusEnum,
    default: IncidentStatusEnum.OPEN,
  })
  status!: IncidentStatusEnum;

  @Index()
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}