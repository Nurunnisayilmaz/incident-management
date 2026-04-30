import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('incident_audit_logs')
@Index(['incidentId'])
export class IncidentAuditLog {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  incidentId!: number;

  @Column()
  field!: string;

  @Column({ type: 'text', nullable: true })
  oldValue!: string | null;

  @Column({ type: 'text', nullable: true })
  newValue!: string | null;

  @Column({ nullable: true })
  changedByUserId?: string;

  @CreateDateColumn()
  createdAt!: Date;
}