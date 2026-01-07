import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('password_reset_tokens')
@Index(['token'], { unique: true }) // Fast unique token lookups
@Index(['userId']) // Fast user-based lookups
@Index(['expiresAt']) // Fast cleanup of expired tokens
export class PasswordResetTokenSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  token: string; // Hashed token for security

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date; // Typically 1 hour for password reset

  @Column({ default: false })
  isUsed: boolean; // Track if token has been used

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date; // When token was used

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
