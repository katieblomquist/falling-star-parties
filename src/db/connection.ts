import "reflect-metadata";
import { DataSource } from "typeorm";
import { Packages } from "./entities/packages";
import { ClientInfo } from "./entities/clientInfo";
import { Characters } from "./entities/characters";
import { Costumes } from "./entities/costumes";
import { AddOns } from "./entities/addOns";
import { EventsAddOns } from "./entities/eventsAddOns";

const AppDataSource = new DataSource({
  type: "postgres",               // or your DB type
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,              // for development, disables in prod
  logging: false,
  entities: [Packages, ClientInfo, Characters, Costumes, AddOns, EventsAddOns],         // add your entities here
  migrations: [],
  subscribers: [],
});

export const getDBConnection = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};