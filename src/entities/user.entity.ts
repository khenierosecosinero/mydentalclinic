import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  contactNumber: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  dateOfBirth?: string;

  @Column({ nullable: true })
  age?: number;

  @Column({ nullable: true })
  occupation?: string;

  @Column({ nullable: true })
  emergencyContactPerson?: string;

  @Column({ nullable: true })
  emergencyContactNumber?: string;

  @Column({ nullable: true })
  maritalStatus?: string;

  @Column({ default: 'patient' }) // 'admin' or 'patient'
  role: string;

  @OneToMany(() => Appointment, appointment => appointment.patient)
  appointments: Appointment[];
}