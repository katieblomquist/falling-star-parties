import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("costumes")
export class Costumes {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  img!: string;

  @Column()
  characterid!: number;

}