import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  async getMe(@Request() req) {
    return req.user;
  }

  @Put('me')
  async updateMe(@Request() req, @Body() body: Partial<any>) {
    return this.usersService.update(req.user.id, body);
  }

  @Put('me/password')
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<any>) {
    return this.usersService.update(+id, body);
  }
}