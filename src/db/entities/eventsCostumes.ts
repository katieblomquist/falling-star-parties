import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Events } from "./events";
import { Costumes } from "./costumes";

@Entity()
export class EventsCostumes {
    @PrimaryColumn()
    eventId!: number;

    @ManyToOne(() => Events)
    @JoinColumn({ name: "eventId", referencedColumnName: "id" })
    events!: Events

    @PrimaryColumn()
    costumeId!: number;
    @ManyToOne(() => Costumes)
    @JoinColumn({name:"costumeId", referencedColumnName:"id"})
    costumes!: Costumes

}