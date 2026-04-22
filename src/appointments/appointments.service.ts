import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { User } from '../entities/user.entity';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async findAll(query?: { status?: string; search?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC' }): Promise<Appointment[]> {
    const where: any = {};
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.search) {
      where.fullName = Like(`%${query.search}%`);
    }
    return this.appointmentRepository.find({
      where: Object.keys(where).length ? where : undefined,
      relations: ['patient'],
      order: { [query?.sortBy || 'createdAt']: query?.sortOrder || 'DESC' },
    });
  }

  async getAdminDashboardSummary(): Promise<{
    totalAppointments: number;
    pendingCount: number;
    approvedCount: number;
    completedCount: number;
    cancelledCount: number;
    totalUsers: number;
    activeUsers: number;
    recentBookings: Appointment[];
    appointmentTrends: Array<{ date: string; count: number }>;
  }> {
    const totalUsers = await this.userRepository.count();
    const inactiveUsers = await this.userRepository.count({ where: { isActive: false } });
    const activeUsers = Math.max(0, totalUsers - inactiveUsers);

    const totalAppointments = await this.appointmentRepository.count();

    const statusRows = await this.appointmentRepository
      .createQueryBuilder('a')
      .select('LOWER(TRIM(a.status))', 'status')
      .addSelect('COUNT(a.id)', 'cnt')
      .groupBy('LOWER(TRIM(a.status))')
      .getRawMany();

    const byStatus: Record<string, number> = { pending: 0, approved: 0, completed: 0, cancelled: 0 };
    for (const row of statusRows) {
      const key = (row.status || '').toLowerCase();
      const n = parseInt(String(row.cnt), 10) || 0;
      if (key === 'pending') byStatus.pending += n;
      else if (key === 'approved') byStatus.approved += n;
      else if (key === 'completed') byStatus.completed += n;
      else if (key === 'cancelled') byStatus.cancelled += n;
    }

    const recentBookings = await this.appointmentRepository.find({
      relations: ['patient'],
      order: { createdAt: 'DESC', id: 'DESC' },
      take: 10,
    });

    const appointmentsForTrend = await this.appointmentRepository.find({ select: ['id', 'date'] });
    const trendMap = new Map<string, number>();
    const last7Days = Array.from({ length: 7 }, (_, idx) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - idx));
      const key = date.toISOString().split('T')[0];
      trendMap.set(key, 0);
      return key;
    });
    appointmentsForTrend.forEach((appointment) => {
      const key = new Date(appointment.date).toISOString().split('T')[0];
      if (trendMap.has(key)) trendMap.set(key, (trendMap.get(key) || 0) + 1);
    });

    return {
      totalAppointments,
      pendingCount: byStatus.pending,
      approvedCount: byStatus.approved,
      completedCount: byStatus.completed,
      cancelledCount: byStatus.cancelled,
      totalUsers,
      activeUsers,
      recentBookings,
      appointmentTrends: last7Days.map((date) => ({ date, count: trendMap.get(date) || 0 })),
    };
  }

  async findByPatient(patientId: number): Promise<Appointment[]> {
    return this.appointmentRepository.find({ where: { patientId }, relations: ['patient'] });
  }

  async findOneById(id: number): Promise<Appointment | null> {
    return this.appointmentRepository.findOne({ where: { id }, relations: ['patient'] });
  }

  async create(date: Date, time: string, patientId: number, fullName: string, email: string, phone: string, dentist: string, service: string, notes?: string): Promise<Appointment> {
    const appointment = this.appointmentRepository.create({ date, time, patientId, fullName, email, phone, dentist, service, notes });
    const saved = await this.appointmentRepository.save(appointment);
    await this.notificationRepository.save(
      this.notificationRepository.create({
        targetRole: 'admin',
        title: 'New appointment',
        message: `${fullName} booked an appointment on ${new Date(date).toLocaleDateString()} at ${time} (${saved.status || 'pending'}).`,
        type: 'appointment',
        appointmentId: saved.id,
        patientName: fullName,
        appointmentDate: saved.date,
        appointmentTime: saved.time,
        appointmentStatus: saved.status || 'pending',
      }),
    );
    return saved;
  }

  async updateStatus(id: number, status: string, remarks?: string): Promise<Appointment | null> {
    await this.appointmentRepository.update(id, { status, remarks });
    const appointment = await this.appointmentRepository.findOne({ where: { id }, relations: ['patient'] });
    if (appointment) {
      await this.notificationRepository.save(
        this.notificationRepository.create({
          userId: appointment.patientId,
          targetRole: 'patient',
          title: 'Appointment update',
          message: `Your appointment on ${new Date(appointment.date).toLocaleDateString()} is now ${status}.`,
          type: 'appointment',
        }),
      );
      await this.notificationRepository.save(
        this.notificationRepository.create({
          targetRole: 'admin',
          title: 'Appointment status updated',
          message: `${appointment.fullName}'s appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} is now ${status}.`,
          type: 'appointment',
          appointmentId: appointment.id,
          patientName: appointment.fullName,
          appointmentDate: appointment.date,
          appointmentTime: appointment.time,
          appointmentStatus: status,
        }),
      );
    }
    return appointment;
  }

  async reschedule(id: number, date: Date, time: string): Promise<Appointment | null> {
    await this.appointmentRepository.update(id, { date, time, status: 'pending' });
    const appointment = await this.appointmentRepository.findOne({ where: { id }, relations: ['patient'] });
    if (appointment) {
      await this.notificationRepository.save(
        this.notificationRepository.create({
          userId: appointment.patientId,
          targetRole: 'patient',
          title: 'Appointment rescheduled',
          message: `Your appointment was rescheduled to ${new Date(date).toLocaleDateString()} ${time}.`,
          type: 'appointment',
        }),
      );
      await this.notificationRepository.save(
        this.notificationRepository.create({
          targetRole: 'admin',
          title: 'Appointment rescheduled',
          message: `${appointment.fullName}'s appointment was moved to ${new Date(date).toLocaleDateString()} at ${time} (pending review).`,
          type: 'appointment',
          appointmentId: appointment.id,
          patientName: appointment.fullName,
          appointmentDate: date,
          appointmentTime: time,
          appointmentStatus: 'pending',
        }),
      );
    }
    return appointment;
  }

  async addRemarks(id: number, remarks: string): Promise<Appointment | null> {
    await this.appointmentRepository.update(id, { remarks });
    return this.appointmentRepository.findOne({ where: { id }, relations: ['patient'] });
  }

  async report(range: 'daily' | 'weekly' | 'monthly'): Promise<{ range: string; total: number; byStatus: Record<string, number> }> {
    const appointments = await this.appointmentRepository.find();
    const now = new Date();
    const start = new Date(now);
    if (range === 'daily') start.setDate(now.getDate() - 1);
    if (range === 'weekly') start.setDate(now.getDate() - 7);
    if (range === 'monthly') start.setMonth(now.getMonth() - 1);

    const filtered = appointments.filter(a => new Date(a.date) >= start);
    const byStatus: Record<string, number> = { pending: 0, approved: 0, completed: 0, cancelled: 0 };
    filtered.forEach((a) => {
      const status = (a.status || 'pending').toLowerCase();
      if (!(status in byStatus)) byStatus[status] = 0;
      byStatus[status] += 1;
    });

    return { range, total: filtered.length, byStatus };
  }

  async delete(id: number, actorRole?: string): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({ where: { id }, relations: ['patient'] });
    if (!appointment) {
      await this.appointmentRepository.delete(id);
      return;
    }

    const isPatient = actorRole === 'patient';
    await this.notificationRepository.save(
      this.notificationRepository.create({
        targetRole: 'admin',
        title: isPatient ? 'Appointment cancelled' : 'Appointment removed',
        message: isPatient
          ? `${appointment.fullName} cancelled their appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}${appointment.service ? ` (${appointment.service})` : ''}.`
          : `An appointment for ${appointment.fullName} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} was removed by an administrator.`,
        type: 'appointment',
        appointmentId: appointment.id,
        patientName: appointment.fullName,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        appointmentStatus: 'cancelled',
      }),
    );

    await this.appointmentRepository.delete(id);
  }
}