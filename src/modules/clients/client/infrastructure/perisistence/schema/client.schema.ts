import { PaymentMethod } from 'src/modules/clients/building/domain/building.entity';
import { BuildingSchema } from 'src/modules/clients/building/infrastructure/persistense/schema/buildingSchema';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('clients')
export class ClientSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyName: string;

  @Column({ unique: true })
  KRAPin: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  paymentMethod: PaymentMethod;

  @OneToMany(() => BuildingSchema, (building) => building.client, {
    cascade: true,
  })
  buildings: BuildingSchema[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
