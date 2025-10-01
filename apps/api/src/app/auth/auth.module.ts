import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@secure-task-manager/auth';
import { UserModule } from '../user/user.module'; 
import { AuthController } from './auth.controller';
import { RolesService, PermissionsGuard } from '@secure-task-manager/auth';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule, 
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get('JWT_SECRET') || 'default_fallback_secret';
        console.log('JWT_SECRET in auth module:', secret);
        
        return {
          secret: secret,
          signOptions: { expiresIn: config.get('JWT_EXPIRY', '24h') },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesService, PermissionsGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, PassportModule, RolesService, PermissionsGuard],
})
export class AuthModule {}