import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('refresh_tokens')
@Index(['tokenHash'], { unique: true })
@Index(['userId'])
@Index(['expiresAt'])
@Index(['isRevoked'])
export class RefreshTokenSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ unique: true })
  tokenHash: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
  @Column({ default: false })
  isRevoked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
