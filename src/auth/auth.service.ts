import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class AuthService {
  private readonly defaultAdminEmail = 'admin@gmail.com';
  private readonly defaultAdminPassword = 'admin123';

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private jwtService: JwtService,
  ) {}

  private async ensureDefaultAdmin(): Promise<User> {
    let admin = await this.userRepository.findOne({ where: { email: this.defaultAdminEmail } });

    if (!admin) {
      admin = this.userRepository.create({
        name: 'System Admin',
        email: this.defaultAdminEmail,
        password: await bcrypt.hash(this.defaultAdminPassword, 10),
        contactNumber: 'N/A',
        role: 'admin',
      });
      return this.userRepository.save(admin);
    }

    if (admin.role !== 'admin') {
      admin.role = 'admin';
      await this.userRepository.save(admin);
    }

    return admin;
  }

  async register(name: string, email: string, password: string, contactNumber: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      contactNumber,
      role: 'patient',
    });
    const savedUser = await this.userRepository.save(user);
    await this.notificationRepository.save(
      this.notificationRepository.create({
        targetRole: 'admin',
        title: 'New user registration',
        message: `${savedUser.name} registered with email ${savedUser.email}`,
        type: 'user',
      }),
    );
    return savedUser;
  }

  async login(email: string, password: string): Promise<{ access_token: string; role: string; redirectTo: string }> {
    await this.ensureDefaultAdmin();
    const normalizedEmail = email.trim().toLowerCase();

    // Always honor the documented default admin credentials and self-heal stored admin record.
    if (normalizedEmail === this.defaultAdminEmail && password === this.defaultAdminPassword) {
      const admin = await this.ensureDefaultAdmin();
      if (admin.role !== 'admin' || !(await bcrypt.compare(this.defaultAdminPassword, admin.password))) {
        admin.role = 'admin';
        admin.password = await bcrypt.hash(this.defaultAdminPassword, 10);
        await this.userRepository.save(admin);
      }

      const payload = { email: admin.email, sub: admin.id, role: admin.role };
      return {
        access_token: this.jwtService.sign(payload),
        role: admin.role,
        redirectTo: '/admin.html',
      };
    }

    const user = await this.userRepository.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const bcryptMatch = await bcrypt.compare(password, user.password).catch(() => false);
    const plainTextMatch = user.password === password;
    if (!bcryptMatch && !plainTextMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isActive === false) {
      throw new UnauthorizedException('This account has been deactivated. Please contact the clinic if you need access.');
    }

    // Migrate legacy plain-text passwords to bcrypt hash on successful login.
    if (plainTextMatch) {
      user.password = await bcrypt.hash(password, 10);
      await this.userRepository.save(user);
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      role: user.role,
      redirectTo: user.role === 'admin' ? '/admin.html' : '/dashboard.html',
    };
  }

  async validateUser(payload: any): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user || user.isActive === false) {
      return null;
    }
    return user;
  }
}