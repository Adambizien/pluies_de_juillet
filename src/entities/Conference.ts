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
import type { Event } from "./Event";
import type { ConferenceCategory } from "./ConferenceCategory";

@Entity({ name: "conferences" })
export class Conference {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => require("./Event").Event, (event: any) => event.conferences)
  @JoinColumn({ name: "eventId" })
  event!: any;

  @Column({ type: "integer" })
  eventId!: number;

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "timestamptz" })
  startDatetime!: Date;

  @Column({ type: "timestamptz" })
  endDatetime!: Date;

  @ManyToOne(() => require("./ConferenceCategory").ConferenceCategory, (category: any) => category.conferences)
  @JoinColumn({ name: "conferenceCategoryId" })
  category!: any;

  @Column({ type: "integer" })
  conferenceCategoryId!: number;

  @Column({ type: "boolean", default: true })
  isVisible!: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(() => require("./UserProgram").UserProgram, (userProgram: any) => userProgram.conference)
  userPrograms?: any[];
}
