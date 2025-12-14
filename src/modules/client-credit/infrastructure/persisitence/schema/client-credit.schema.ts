import { Client } from "src/modules/clients/client/domain/entities/client.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('client_credits')
export class ClientCreditSchema {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'client_id', unique: true })
    clientId: string;

    @OneToOne(() => Client, { eager: true })
    @JoinColumn({ name: 'client_id' })
    client: Client;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    balance: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt: Date;
}