import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
  console.log('JWT_SECRET:', process.env.JWT_SECRET);  
  super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecretkey', 
      
    });
  }
// attaches user info to request.user
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, roleId: payload.roleId ?? payload.role_id ?? payload.role };
  }
}