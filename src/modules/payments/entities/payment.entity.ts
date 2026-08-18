import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { User } from 'src/modules/users/entities/user.entity';
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

export type PaymentType = 'deposit' | 'balance';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

@Entity('payments')
@Index(['booking_id'])
@Index(['user_id'])
@Index(['status'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  booking_id: string;

  @ManyToOne(() => Booking, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  stripe_checkout_session_id?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripe_payment_intent_id?: string;

  @Column({ type: 'varchar', length: 20 })
  type: PaymentType;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: PaymentStatus;

  @Column({ type: 'varchar', nullable: true })
  receipt_url?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
