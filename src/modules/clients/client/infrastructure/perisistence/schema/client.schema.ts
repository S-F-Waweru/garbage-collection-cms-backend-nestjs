import { PaymentMethod } from 'src/modules/clients/building/domain/building.entity';
import { BuildingShema } from 'src/modules/clients/building/infrastructure/persistense/schema/building.shema';
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

  @OneToMany(() => BuildingShema, (building) => building.client, {
    cascade: true,
  })
  buildings: BuildingShema[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
