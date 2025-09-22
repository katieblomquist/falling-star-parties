import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, PrimaryColumn, IntegerType } from "typeorm";
import { DateTimeTransformer } from "../transformers/dateTimeTransformer";
import { DateTime } from "luxon";
import { Packages } from "./packages";
import { ClientInfo } from "./clientInfo";

@Entity("events")
export class Events {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type:"timestamp",
    transformer: new DateTimeTransformer()
  })
  dateTime!: DateTime;

  @Column()
  address!: string;

  @Column()
  packageId!: number;
  @ManyToOne(() => Packages)
  @JoinColumn({name: "packageId", referencedColumnName: "id"})
  packages!: Packages

  @Column({ nullable: true })
  childName!: string

  @Column({ nullable: true })
  childAge!: number

  @Column({ nullable: true })
  orgName!: string

  @Column()
  numGuests!: number

  @Column()
  outdoor!: boolean

  @Column()
  photoRelease!: boolean

  @Column({ nullable: true })
  additionalInfo!: string

  @Column()
  clientId!: number;
  @ManyToOne(() => ClientInfo)
  @JoinColumn({name: "clientId", referencedColumnName: "id"})
  clientInfo!: ClientInfo

}