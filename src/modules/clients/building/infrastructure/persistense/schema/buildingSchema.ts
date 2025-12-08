import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LocationSchema } from '../../../../../location/infrastracture/persistence/schema/location.schema';
import { ClientSchema } from '../../../../client/infrastructure/perisistence/schema/client.schema';

@Entity('buildings')
export class BuildingSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => LocationSchema, { eager: true }) // Changed from @OneToOne
  @JoinColumn({ name: 'locationId' }) // Add explicit column name
  location: LocationSchema;

  @ManyToOne(() => ClientSchema, { eager: true })
  client: ClientSchema;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('int')
  unitCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
