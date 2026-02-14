import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SUPER_SECRET_KEY_UV1', // Use the same key as your AuthService
    });
  }

  async validate(payload: any) {
    // This return value is what ends up in req.user
    return { id: payload.sub, email: payload.email, username: payload.username };
  }
}