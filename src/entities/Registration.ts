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
import { Event } from "./Event";

@Entity({ name: "registrations" })
export class Registration {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user: User) => user.registrations)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "integer" })
  userId!: number;

  @ManyToOne(() => Event, (event: Event) => event.registrations)
  @JoinColumn({ name: "eventId" })
  event!: Event;

  @Column({ type: "integer" })
  eventId!: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
