import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service.js';
import { UserService } from '../user/user.service.js';
import { MailService } from '../mail/mail.service.js'; 
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  // 1. UPDATED: Added explicit Profile fetch logic for the Mobile App
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) throw new UnauthorizedException('USER_NOT_FOUND');

    // Remove sensitive data before returning
    const { password, resetToken, resetTokenExpires, verificationToken, ...result } = user;
    return result; // This now includes 'image' naturally
  }

  async login(loginDto: any) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('ACCESS_DENIED: Invalid Credentials');
    }

    const payload = { 
      sub: user.id, 
      email: user.email,
      username: user.username 
    };

    // Ensure 'image' is included in the initial login response
    const { password: _, ...result } = user;

    return {
      user: result,
      access_token: this.jwtService.sign(payload), 
    };
  }

  // ... (validateUser, register, verifyEmail remain the same) ...

  async updateUserImage(userId: string, imagePath: string) {
    // We await and return the result to ensure the controller gets the updated record
    return await this.prisma.user.update({
      where: { id: userId },
      data: { 
        image: imagePath 
      },
    });
  }
}