import { Controller, Get, Put, Param, Body, UseGuards, Request, ForbiddenException, Query, Post, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  private sanitize(user: any) {
    if (!user) return user;
    const { password, ...rest } = user;
    return rest;
  }

  @Get()
  async findAll(@Request() req, @Query('search') search?: string, @Query('role') role?: string, @Query('isActive') isActive?: string) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    const users = await this.usersService.findAll({ search, role, isActive });
    return users.map((user) => this.sanitize(user));
  }

  @Get('me')
  async getMe(@Request() req) {
    return this.sanitize(req.user);
  }

  @Put('me')
  async updateMe(@Request() req, @Body() body: Partial<any>) {
    const updated = await this.usersService.update(req.user.id, body);
    return this.sanitize(updated);
  }

  @Put('me/password')
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const updated = await this.usersService.changePassword(req.user.id, body.currentPassword, body.newPassword);
    return this.sanitize(updated);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    if (req.user?.role !== 'admin' && req.user?.id !== +id) {
      throw new ForbiddenException('Access denied');
    }
    const user = await this.usersService.findOne(+id);
    return this.sanitize(user);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<any>, @Request() req) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    const updated = await this.usersService.update(+id, body);
    return this.sanitize(updated);
  }

  @Post()
  async create(@Body() body: { name: string; email: string; password: string; contactNumber: string; role?: string }, @Request() req) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    const created = await this.usersService.createByAdmin(body);
    return this.sanitize(created);
  }

  @Put(':id/active')
  async setActive(@Param('id') id: string, @Body() body: { isActive: boolean }, @Request() req) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    const updated = await this.usersService.setActive(+id, body.isActive);
    return this.sanitize(updated);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.usersService.delete(+id);
  }
}