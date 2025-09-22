import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Events } from "./events";
import { Costumes } from "./costumes";
import { Characters } from "./characters";

@Entity("events_characters")
export class EventsCharacters {
    @PrimaryColumn()
    eventId!: number;

    @ManyToOne(() => Events)
    @JoinColumn({ name: "eventId", referencedColumnName: "id" })
    events!: Events

    @PrimaryColumn()
    characterId!: number;
    @ManyToOne(() => Characters)
    @JoinColumn({name:"characterId", referencedColumnName:"id"})
    characters!: Characters

    @Column({ nullable: true })
    costumeId!: number;
    @ManyToOne(() => Costumes)
    @JoinColumn({name:"costumeId", referencedColumnName:"id"})
    costumes!: Characters

}