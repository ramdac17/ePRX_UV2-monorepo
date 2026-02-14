import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) { // 2. Inject it here
    super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  // Use the '!' to tell TS: "I know this exists in .env"
  secretOrKey: configService.get<string>('JWT_SECRET')!, 
});
  }

  // This method runs AFTER the token is decrypted
 async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('INVALID_UPLINK_TOKEN');
    }
    // This return value becomes 'req.user' in your controller
    return { id: payload.sub, email: payload.email };
  }
}