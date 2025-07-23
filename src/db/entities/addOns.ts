import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
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