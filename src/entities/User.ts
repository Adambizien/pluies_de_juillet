import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

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

  @OneToOne(() => require("./UserInfo").UserInfo, (userInfo: any) => userInfo.user, {
    cascade: true,
  })
  userInfo?: any;

  @OneToMany(() => require("./Registration").Registration, (registration: any) => registration.user)
  registrations?: any[];

  @OneToMany(() => require("./UserProgram").UserProgram, (userProgram: any) => userProgram.user)
  programs?: any[];
}
