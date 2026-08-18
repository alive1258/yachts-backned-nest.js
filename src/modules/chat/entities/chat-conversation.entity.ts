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

export type ChatConversationStatus = 'open' | 'closed';

/**
 * One support thread per customer — mirrors the single-thread widget on the
 * public site (MessageWidget). Whichever staff member replies first becomes
 * `assigned_staff_id`, shown in the inbox, but any staff holding the
 * `support-chat` edit permission can still reply.
 */
@Entity('chat_conversations')
@Index(['status'])
export class ChatConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  customer_id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ type: 'uuid', nullable: true })
  assigned_staff_id?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_staff_id' })
  assignedStaff?: User;

  @Column({ type: 'varchar', length: 10, default: 'open' })
  status: ChatConversationStatus;

  @Column({ type: 'timestamptz', nullable: true })
  last_message_at?: Date;

  @Column({ type: 'varchar', length: 280, nullable: true })
  last_message_preview?: string;

  /** Unread messages waiting on the customer's side (sent by staff) */
  @Column({ type: 'int', default: 0 })
  customer_unread_count: number;

  /** Unread messages waiting on the support-staff side (sent by customer) */
  @Column({ type: 'int', default: 0 })
  staff_unread_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
