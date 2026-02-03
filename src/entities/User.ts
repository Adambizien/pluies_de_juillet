import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserInfo } from "./UserInfo";
import { Registration } from "./Registration";
import { UserProgram } from "./UserProgram";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "text" })
  password!: string;

  @Column({ type: "varchar", default: UserRole.USER })
  role!: UserRole;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;

  @OneToOne(() => UserInfo, (userInfo: UserInfo) => userInfo.user, {
    cascade: true,
  })
  userInfo?: UserInfo;

  @OneToMany(() => Registration, (registration: Registration) => registration.user)
  registrations?: Registration[];

  @OneToMany(() => UserProgram, (userProgram: UserProgram) => userProgram.user)
  programs?: UserProgram[];
}
