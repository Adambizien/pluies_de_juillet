import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventCategory } from "./EventCategory";
import { Conference } from "./Conference";
import { Registration } from "./Registration";

@Entity({ name: "events" })
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "timestamptz" })
  startDate!: Date;

  @Column({ type: "timestamptz" })
  endDate!: Date;

  @Column({ type: "boolean", default: true })
  isVisible!: boolean;

  @ManyToOne(() => EventCategory, (category: EventCategory) => category.events)
  @JoinColumn({ name: "eventCategoryId" })
  category!: EventCategory;

  @Column({ type: "integer" })
  eventCategoryId!: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(() => Conference, (conference: Conference) => conference.event, { cascade: ["remove"] })
  conferences?: Conference[];

  @OneToMany(() => Registration, (registration: Registration) => registration.event)
  registrations?: Registration[];
}
