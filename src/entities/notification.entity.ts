import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId?: number;

  @ManyToOne(() => User, user => user.notifications, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ default: 'all' }) // 'all', 'admin', 'patient'
  targetRole: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: 'info' }) // 'info', 'appointment', 'user'
  type: string;

  /** Snapshot for appointment-related admin notifications */
  @Column({ nullable: true })
  appointmentId?: number;

  @Column({ nullable: true })
  patientName?: string;

  @Column({ type: 'datetime', nullable: true })
  appointmentDate?: Date;

  @Column({ nullable: true })
  appointmentTime?: string;

  @Column({ nullable: true })
  appointmentStatus?: string;

  @CreateDateColumn()
  createdAt: Date;
}
