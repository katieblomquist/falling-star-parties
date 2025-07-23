import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("packages")
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
  additionalcharactercost!: number;

  @Column()
  type!: string;
}