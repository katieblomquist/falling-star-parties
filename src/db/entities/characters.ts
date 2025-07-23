import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Characters {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  image!: string;

}