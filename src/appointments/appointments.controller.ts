import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, ForbiddenException, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.appointmentsService.findAll({ status, search, sortBy, sortOrder });
  }

  @Get('admin/summary')
  async getAdminSummary(@Request() req) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.appointmentsService.getAdminDashboardSummary();
  }

  @Get('my')
  async findMy(@Request() req) {
    return this.appointmentsService.findByPatient(req.user.id);
  }

  @Post()
  async create(@Body() body: { date: string; time: string; fullName: string; email: string; phone: string; dentist: string; service: string; notes?: string }, @Request() req) {
    return this.appointmentsService.create(new Date(body.date), body.time, req.user.id, body.fullName, body.email, body.phone, body.dentist, body.service, body.notes);
  }

  @Put(':id')
  async reschedule(@Param('id') id: string, @Body() body: { date: string; time: string }, @Request() req) {
    const appointment = await this.appointmentsService.findOneById(+id);
    if (!appointment) {
      return null;
    }
    if (req.user?.role !== 'admin' && appointment.patientId !== req.user?.id) {
      throw new ForbiddenException('Access denied');
    }
    return this.appointmentsService.reschedule(+id, new Date(body.date), body.time);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string; remarks?: string }, @Request() req) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.appointmentsService.updateStatus(+id, body.status, body.remarks);
  }

  @Put(':id/remarks')
  async addRemarks(@Param('id') id: string, @Body() body: { remarks: string }, @Request() req) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.appointmentsService.addRemarks(+id, body.remarks);
  }

  @Get('admin/report')
  async report(@Request() req, @Query('range') range: 'daily' | 'weekly' | 'monthly' = 'weekly') {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.appointmentsService.report(range);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    const appointment = await this.appointmentsService.findOneById(+id);
    if (!appointment) {
      return null;
    }
    if (req.user?.role !== 'admin' && appointment.patientId !== req.user?.id) {
      throw new ForbiddenException('Access denied');
    }
    return this.appointmentsService.delete(+id, req.user?.role);
  }
}