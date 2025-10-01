import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET', 'default_fallback_secret');
    //console.log('JWT_SECRET in strategy:', secret);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, 
      
    });
  }
// attaches user info to request.user
  async validate(payload: any) {
    console.log('JWT payload validated:', payload);
    return {
      id: payload.sub,
      email: payload.email,
      roleId: payload.roleId,
      organizationId: payload.organizationId,
    };
  }
}