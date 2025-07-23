import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("characters")
export class Characters {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  img!: string;

}