import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { UserInfo } from "./entities/UserInfo";
import { EventCategory } from "./entities/EventCategory";
import { ConferenceCategory } from "./entities/ConferenceCategory";
import { Event } from "./entities/Event";
import { Conference } from "./entities/Conference";
import { UserProgram } from "./entities/UserProgram";
import { Registration } from "./entities/Registration";

const isDev = process.env.NODE_ENV !== "production";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.DB_SYNC === "true" || isDev,
  logging: process.env.DB_LOGGING === "true",
  entities: [User, UserInfo, EventCategory, ConferenceCategory, Event, Conference, UserProgram, Registration],
  migrations: ["src/migrations/*.{ts,js}"],
});
