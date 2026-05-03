import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { UserBaseType } from "../types/user.base.type";

@Entity("users")
export class User implements UserBaseType {

  @Index()
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, length: 32 })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}