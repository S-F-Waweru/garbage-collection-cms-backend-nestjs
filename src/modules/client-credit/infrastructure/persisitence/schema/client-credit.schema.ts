import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClientSchema } from '../../../../clients/client/infrastructure/perisistence/schema/client.schema';

@Entity('client_credits')
export class ClientCreditSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  clientId: string;

  @OneToOne(() => ClientSchema, (client) => client.credit)
  @JoinColumn({ name: 'clientId' })
  client: ClientSchema;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
