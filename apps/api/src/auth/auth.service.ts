import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service.js';
import { UserService } from '../user/user.service.js';
import { MailService } from '../mail/mail.service.js'; 
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  [x: string]: any;
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: any) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('ACCESS_DENIED: Invalid Credentials');
    }

    const payload = { 
      sub: user.id, 
      email: user.email,
      username: user.username 
    };

    const { password: _, ...result } = user;

    return {
      user: result,
      // Fixed: The frontend was looking for "access_token" in previous logs
      access_token: this.jwtService.sign(payload), 
    };
  }

  // Helper for Passport strategies
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email); 
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(data: any) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    
    // Generate token if not provided by controller
    const vToken = data.verificationToken || crypto.randomBytes(32).toString('hex');

    const newUser = await this.userService.createUser({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      mobile: data.mobile,
      username: data.username,
      verificationToken: vToken, 
      emailVerified: false,
    });

    try {
      await this.mailService.sendVerificationEmail(
        newUser.email, 
        newUser.verificationToken ?? "" 
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'UNKNOWN_SYSTEM_ERROR';
    }

    const { password, ...result } = newUser;
    return {
      message: 'RECRUIT_SYNC_COMPLETE. CHECK_INBOX.',
      user: result,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({ 
      where: { verificationToken: token } 
    });

    if (!user) throw new BadRequestException('INVALID_TOKEN');

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null, 
      },
    });

    return { status: 'IDENTITY_CONFIRMED', email: updatedUser.email };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'RECOVERY_LINK_SENT_IF_EXISTS' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); 

    await this.prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpires: expires },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await this.mailService.sendPasswordResetEmail(user.email, resetUrl);

    return { message: 'RECOVERY_PROTOCOL_INITIATED' };
  }

  async resetPassword(resetDto: { token: string; newPassword: string }) {
    const { token, newPassword } = resetDto;

    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestException('LINK_EXPIRED');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return { status: 'CREDENTIALS_REGENERATED' };
  }

  async updateUserImage(userId: string, imagePath: string) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { image: imagePath },
      });
    } catch (error) {
      console.error('--- [ePRX_UV1] DB_IMAGE_UPDATE_FAILED ---', error);
      throw new Error('Could not sync profile image to database.');
    }
  }
}