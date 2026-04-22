import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  time: string; // e.g., '10:00'

  @Column({ default: 'pending' }) // 'pending', 'approved', 'cancelled', 'completed'
  status: string;

  @ManyToOne(() => User, user => user.appointments)
  @JoinColumn({ name: 'patientId' })
  patient: User;

  @Column()
  patientId: number;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  dentist: string;

  @Column()
  service: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}