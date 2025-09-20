import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@secure-task-manager/auth';
import { UserModule } from '../user/user.module'; 
import { AuthController } from './auth.controller';
import { RolesService } from '@secure-task-manager/auth';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule, 
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'supersecretkey', // securely pulls from .env
        signOptions: { expiresIn: '3600s' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesService],
  controllers: [AuthController],
  exports: [AuthService, RolesService],
})
export class AuthModule {}