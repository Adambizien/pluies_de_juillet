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
import type { Event } from "./Event";

@Entity({ name: "registrations" })
export class Registration {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => require("./User").User, (user: any) => user.registrations)
  @JoinColumn({ name: "userId" })
  user!: any;

  @Column({ type: "integer" })
  userId!: number;

  @ManyToOne(() => require("./Event").Event, (event: any) => event.registrations)
  @JoinColumn({ name: "eventId" })
  event!: any;

  @Column({ type: "integer" })
  eventId!: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
