import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { TaskModule } from './task/task.module';
import { Task } from './entities/task.entity';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogModule } from './audit/audit-log.module';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env', 
    }),

    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'admin'),
        database: config.get('DB_NAME', 'secure_task_manager'),
        entities: [User, Organization, Role, Permission, Task, AuditLog],
        synchronize: true,
      }),
    }),

    TypeOrmModule.forFeature([User, Organization, Role, Permission, Task, AuditLog]),

    TaskModule,
    AuditLogModule,
    RoleModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}