import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ClientInfo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column()
  phone!: string;

}