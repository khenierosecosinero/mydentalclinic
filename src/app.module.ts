import { existsSync } from 'fs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

/** Prefer repo `public/` (works with `nest build` only); else `dist/public` after full `npm run build`. */
function resolvePublicRoot(): string {
  const fromCwd = join(process.cwd(), 'public');
  const fromDist = join(__dirname, '..', 'public');
  if (existsSync(join(fromCwd, 'index.html'))) return fromCwd;
  if (existsSync(join(fromDist, 'index.html'))) return fromDist;
  return fromCwd;
}
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { User } from './entities/user.entity';
import { Appointment } from './entities/appointment.entity';
import { Notification } from './entities/notification.entity';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        // Load .env relative to the compiled output directory (dist)
        `${__dirname}/../.env`,
        // Fallback to workspace root
        `${process.cwd()}/.env`,
        // Fallback when running from parent directory
        `${process.cwd()}/my-dental/.env`,
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get<string>('DB_TYPE', 'sqlite');
        if (dbType === 'mysql') {
          return {
            type: 'mysql' as const,
            host: config.get<string>('DB_HOST', 'localhost'),
            port: +config.get<number>('DB_PORT', 3306),
            username: config.get<string>('DB_USERNAME', 'root'),
            password: config.get<string>('DB_PASSWORD', ''),
            database: config.get<string>('DB_NAME', 'dental_clinic'),
            entities: [User, Appointment, Notification],
            synchronize: true, // Use false in production
          };
        }

        return {
          type: 'sqlite' as const,
          database: config.get<string>('SQLITE_PATH', './data/dental_clinic.sqlite'),
          entities: [User, Appointment, Notification],
          synchronize: true,
        };
      },
    }),
    AuthModule,
    UsersModule,
    AppointmentsModule,
    NotificationsModule,
    // Register static files after API modules so routes like /appointments/admin/summary
    // are handled by controllers instead of the static middleware.
    ServeStaticModule.forRoot({
      rootPath: resolvePublicRoot(),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
