import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get()
  async findAll() {
    return this.appointmentsService.findAll();
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
  async reschedule(@Param('id') id: string, @Body() body: { date: string; time: string }) {
    return this.appointmentsService.reschedule(+id, new Date(body.date), body.time);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.appointmentsService.updateStatus(+id, body.status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.appointmentsService.delete(+id);
  }
}