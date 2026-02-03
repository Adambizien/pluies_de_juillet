import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Conference } from "./Conference";

@Entity({ name: "user_programs" })
export class UserProgram {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user: User) => user.programs)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "integer" })
  userId!: number;

  @ManyToOne(() => Conference, (conference: Conference) => conference.userPrograms)
  @JoinColumn({ name: "conferenceId" })
  conference!: Conference;

  @Column({ type: "integer" })
  conferenceId!: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
