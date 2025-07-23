import "reflect-metadata";
import { DataSource } from "typeorm";
import { Packages } from "./entities/packages";
import { ClientInfo } from "./entities/clientInfo";
import { Characters } from "./entities/characters";
import { Costumes } from "./entities/costumes";
import { AddOns } from "./entities/addOns";
import { EventsAddOns } from "./entities/eventsAddOns";
import { Events } from "./entities/events";
import { EventsCostumes } from "./entities/eventsCostumes";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [Packages, ClientInfo, Characters, Costumes, AddOns, EventsAddOns, Events, EventsCostumes],
  migrations: [],
  subscribers: [],
});

export const getDBConnection = async (): Promise<DataSource> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize().catch(err => {
        console.error("Error during DataSource Initialization: ", err)
        throw err;
    });
  }
  return AppDataSource;
};