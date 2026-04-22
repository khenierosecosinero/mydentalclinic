import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(query?: { search?: string; role?: string; isActive?: string }): Promise<User[]> {
    const where: any = {};
    if (query?.search) {
      where.name = Like(`%${query.search}%`);
    }
    if (query?.role) {
      where.role = query.role;
    }
    if (query?.isActive === 'true' || query?.isActive === 'false') {
      where.isActive = query.isActive === 'true';
    }
    return this.userRepository.find({ where: Object.keys(where).length ? where : undefined, relations: ['appointments'] });
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id }, relations: ['appointments'] });
  }

  async update(id: number, updateData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, updateData);
    return this.findOne(id);
  }

  async createByAdmin(data: { name: string; email: string; password: string; contactNumber: string; role?: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      name: data.name,
      email: data.email.trim().toLowerCase(),
      password: hashedPassword,
      contactNumber: data.contactNumber,
      role: data.role || 'patient',
      isActive: true,
    });
    return this.userRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async setActive(id: number, isActive: boolean): Promise<User | null> {
    await this.userRepository.update(id, { isActive });
    return this.findOne(id);
  }

  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Current password is incorrect');

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(id, { password: hashed });
    return this.findOne(id);
  }
}