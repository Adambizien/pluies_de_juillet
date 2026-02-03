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
import { Event } from "./Event";
import { ConferenceCategory } from "./ConferenceCategory";
import { UserProgram } from "./UserProgram";

@Entity({ name: "conferences" })
export class Conference {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Event, (event: Event) => event.conferences)
  @JoinColumn({ name: "eventId" })
  event!: Event;

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

  @ManyToOne(() => ConferenceCategory, (category: ConferenceCategory) => category.conferences)
  @JoinColumn({ name: "conferenceCategoryId" })
  category!: ConferenceCategory;

  @Column({ type: "integer" })
  conferenceCategoryId!: number;

  @Column({ type: "boolean", default: true })
  isVisible!: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(() => UserProgram, (userProgram: UserProgram) => userProgram.conference)
  userPrograms?: UserProgram[];
}
