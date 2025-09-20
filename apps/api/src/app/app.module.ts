import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
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
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'admin',
      database: process.env.DB_NAME || 'secure_task_manager',
      entities: [User, Organization, Role, Permission, Task, AuditLog],
      synchronize: true, // ⚠️ Keep this true only for development!
    }),
    TypeOrmModule.forFeature([User, Organization, Role, Permission, Task, AuditLog]),
    ConfigModule.forRoot({ isGlobal: true }),
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