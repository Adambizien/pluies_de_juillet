import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { UserInfo } from "./entities/UserInfo";

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
  entities: [User, UserInfo],
  migrations: ["src/migrations/*.{ts,js}"],
});
