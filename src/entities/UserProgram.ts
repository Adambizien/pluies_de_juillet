import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { User } from "./User";
import type { Conference } from "./Conference";

@Entity({ name: "user_programs" })
export class UserProgram {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => require("./User").User, (user: any) => user.programs)
  @JoinColumn({ name: "userId" })
  user!: any;

  @Column({ type: "integer" })
  userId!: number;

  @ManyToOne(() => require("./Conference").Conference, (conference: any) => conference.userPrograms)
  @JoinColumn({ name: "conferenceId" })
  conference!: any;

  @Column({ type: "integer" })
  conferenceId!: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
