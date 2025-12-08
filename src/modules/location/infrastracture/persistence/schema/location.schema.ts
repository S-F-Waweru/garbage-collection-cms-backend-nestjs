import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BuildingSchema } from '../../../../clients/building/infrastructure/persistense/schema/buildingSchema';

@Entity('locations')
@Index('IDX_city_region_active', ['city', 'region'], {
  unique: true,
  where: '"deletedAt" IS NULL', // wrap in quotes for Postgres compatibility
})
export class LocationSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  city: string;

  @Column()
  region: string;

  @OneToMany(() => BuildingSchema, (building) => building.location)
  buildings: BuildingSchema[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
