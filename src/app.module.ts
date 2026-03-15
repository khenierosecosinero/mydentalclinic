import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { User } from './entities/user.entity';
import { Appointment } from './entities/appointment.entity';

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
            entities: [User, Appointment],
            synchronize: true, // Use false in production
          };
        }

        return {
          type: 'sqlite' as const,
          database: config.get<string>('SQLITE_PATH', './data/dental_clinic.sqlite'),
          entities: [User, Appointment],
          synchronize: true,
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    AuthModule,
    UsersModule,
    AppointmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
