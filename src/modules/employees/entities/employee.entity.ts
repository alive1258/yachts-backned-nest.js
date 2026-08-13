import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

// HR-profile extension for staff accounts. Identity/login stays entirely on
// User (same signup/OTP/JWT pipeline patients use) — this table only holds
// staff-specific metadata layered on top of a user whose role is admin-tier.
@Entity({ name: 'employees' })
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  user_id: string;

  /**
   * Human-readable staff code, e.g. EMP-3F2A9C1B
   */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20 })
  staff_code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  designation?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department?: string;

  /**
   * Which super_admin/admin created this staff record (audit trail)
   */
  @Column({ type: 'uuid' })
  created_by: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
