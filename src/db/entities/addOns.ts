import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("add_ons")
export class AddOns {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  cost!: number;

  @Column()
  type!: string;
}