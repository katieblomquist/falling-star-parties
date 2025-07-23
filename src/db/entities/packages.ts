import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Packages {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  duration!: string;

  @Column()
  cost!: number;

  @Column()
  additionalCharacterCost!: number;

  @Column()
  type!: string;
}