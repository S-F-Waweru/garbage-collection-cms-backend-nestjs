import { ClientCreditSchema } from 'src/modules/client-credit/infrastructure/persisitence/schema/client-credit.schema';
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

  // realtions
    @OneToMany(() => BuildingSchema, (building) => building.client, {
    cascade: true,
  })
  buildings: BuildingSchema[];

  @OneToOne(() => ClientCreditSchema, (credit) => credit.client)
  credit: ClientCreditSchema;
  

  // Dates

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
function OneToOne(arg0: () => any, arg1: (credit: any) => any): (target: ClientSchema, propertyKey: "credit") => void {
  throw new Error('Function not implemented.');
}

