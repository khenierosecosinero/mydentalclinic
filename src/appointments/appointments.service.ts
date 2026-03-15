import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({ relations: ['patient'] });
  }

  async findByPatient(patientId: number): Promise<Appointment[]> {
    return this.appointmentRepository.find({ where: { patientId }, relations: ['patient'] });
  }

  async create(date: Date, time: string, patientId: number, fullName: string, email: string, phone: string, dentist: string, service: string, notes?: string): Promise<Appointment> {
    const appointment = this.appointmentRepository.create({ date, time, patientId, fullName, email, phone, dentist, service, notes });
    return this.appointmentRepository.save(appointment);
  }

  async updateStatus(id: number, status: string): Promise<Appointment | null> {
    await this.appointmentRepository.update(id, { status });
    return this.appointmentRepository.findOne({ where: { id }, relations: ['patient'] });
  }

  async reschedule(id: number, date: Date, time: string): Promise<Appointment | null> {
    await this.appointmentRepository.update(id, { date, time, status: 'pending' });
    return this.appointmentRepository.findOne({ where: { id }, relations: ['patient'] });
  }

  async delete(id: number): Promise<void> {
    await this.appointmentRepository.delete(id);
  }
}