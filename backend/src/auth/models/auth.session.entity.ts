import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { AuthSessionBaseType } from "../types/auth-session.base.type";

@Entity("auth_sessions")
export class AuthSession implements AuthSessionBaseType {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  sessionId!: string;

  @Column()
  userId!: string;

  @Column()
  refreshToken!: string;

  @Column({ type: "timestamp", nullable: true })
  expiredAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;
}