import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "user_info" })
export class UserInfo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: true })
  userId!: number;

  @OneToOne(() => User, (user) => user.userInfo, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "varchar" })
  firstname!: string;

  @Column({ type: "varchar", nullable: true })
  lastname?: string | null;

  @Column({ type: "date", nullable: true })
  dateOfBirth?: Date | null;

  @Column({ type: "varchar", nullable: true })
  phone?: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
