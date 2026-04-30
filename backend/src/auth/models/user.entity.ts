import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserBaseType } from "../types/user.base.type";

@Entity("users")
export class User implements UserBaseType {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, length: 32 })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}