import { ClientCreditSchema } from 'src/modules/client-credit/infrastructure/persisitence/schema/client-credit.schema';
import { PaymentMethod } from 'src/modules/clients/building/domain/building.entity';
import { BuildingSchema } from 'src/modules/clients/building/infrastructure/persistense/schema/buildingSchema';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne, // Make sure this is imported
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

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column()
  billingDate: number;

  // relations
  @OneToMany(() => BuildingSchema, (building) => building.client, {
    cascade: true,
  })
  buildings: BuildingSchema[];

  @OneToOne(() => ClientCreditSchema, (credit) => credit.client, {
    cascade: true, // Optional: add if you want cascade operations
    nullable: true, // Optional: add if the relationship can be null
  })
  @JoinColumn() // This is important for OneToOne relations to specify the owner side
  credit: ClientCreditSchema;

  // Dates
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
