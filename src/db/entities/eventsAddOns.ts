import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Events } from "./events";
import { AddOns } from "./addOns";

@Entity()
export class EventsAddOns {
  @PrimaryColumn()
  eventId!: number;

  @ManyToOne(() => Events)
  @JoinColumn({name: "eventId", referencedColumnName: "id"})
  events!: Events

  @PrimaryColumn()
  addOnId!: number;
  @ManyToOne(() => AddOns)
  @JoinColumn({name: "addOnId", referencedColumnName: "id"})
  addOns!: AddOns

}