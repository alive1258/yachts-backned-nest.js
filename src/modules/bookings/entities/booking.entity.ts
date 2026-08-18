import { User } from 'src/modules/users/entities/user.entity';
import { Yacht } from 'src/modules/yachts/entities/yacht.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type BookingPaymentStatus =
  | 'unpaid'
  | 'deposit_paid'
  | 'paid_in_full'
  | 'refunded';

@Entity('bookings')
@Index(['yacht_id'])
@Index(['user_id'])
@Index(['status'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /* =========================
        RELATIONS
  ========================= */

  @Column({ type: 'uuid' })
  yacht_id: string;

  @ManyToOne(() => Yacht, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'yacht_id' })
  yacht: Yacht;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /* =========================
        CHARTER DETAILS
  ========================= */

  @Column({ type: 'date' })
  check_in: string;

  @Column({ type: 'date' })
  check_out: string;

  /** Snapshot at booking time — derived from check_in/check_out */
  @Column({ type: 'int' })
  nights: number;

  @Column({ type: 'int' })
  guests: number;

  @Column({ type: 'varchar', length: 255 })
  guest_name: string;

  @Column({ type: 'varchar', length: 255 })
  guest_email: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  guest_phone?: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  /* =========================
        PRICING (snapshotted at booking time)
  ========================= */

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price_per_night: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  subtotal_amount: number;

  @Column({ type: 'int', default: 30 })
  deposit_percentage: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  deposit_amount: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  balance_amount: number;

  /* =========================
        STATUS
  ========================= */

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: BookingStatus;

  @Column({ type: 'varchar', length: 20, default: 'unpaid' })
  payment_status: BookingPaymentStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
