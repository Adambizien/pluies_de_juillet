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
import type { EventCategory } from "./EventCategory";
import type { Conference } from "./Conference";

@Entity({ name: "events" })
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "date" })
  startDate!: string;

  @Column({ type: "date" })
  endDate!: string;

  @Column({ type: "boolean", default: true })
  isVisible!: boolean;

  @ManyToOne(() => require("./EventCategory").EventCategory, (category: any) => category.events)
  @JoinColumn({ name: "eventCategoryId" })
  category!: any;

  @Column({ type: "integer" })
  eventCategoryId!: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(() => require("./Conference").Conference, (conference: any) => conference.event)
  conferences?: any[];

  @OneToMany(() => require("./Registration").Registration, (registration: any) => registration.event)
  registrations?: any[];
}
