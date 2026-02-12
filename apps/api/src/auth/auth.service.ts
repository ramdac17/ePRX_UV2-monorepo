import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // 1. Import this
import { PrismaService } from '../prisma.service.js';
import { UserService } from '../user/user.service.js';
import { MailService } from '../mail/mail.service.js'; 
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private mailService: MailService,
    private jwtService: JwtService, // 2. Inject this
  ) {}

  async login(loginDto: any) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Username and/or Password is invalid');
    }

    // 3. Generate the JWT Payload
    const payload = { 
      sub: user.id, 
      email: user.email,
      username: user.username 
    };

    const { password: _, ...result } = user;

    // 4. Return the structure the Frontend is looking for!
    return {
      user: result,
      token: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email); 
    if (user) {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  // Unified Register Method
  async register(data: any) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    console.log('1. INITIATING_DB_RECORD_CREATION for:', data.email);

    // Create the user via the UserService
    const newUser = await this.userService.createUser({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      mobile: data.mobile,
      username: data.username,
      verificationToken: data.verificationToken, // Token passed from Controller
      emailVerified: false,
    });

    console.log('2. USER_CREATED_SUCCESSFULLY. TOKEN:', newUser.verificationToken);

    try {
      console.log('3. ATTEMPTING_MAIL_TRANSMISSION...');
      // TRIGGER_EMAIL: Call your email utility here
      await this.mailService.sendVerificationEmail(
        newUser.email, 
        newUser.verificationToken
      );
      console.log('4. MAIL_TRANSMISSION_COMPLETE');
    } catch (error) {
      console.error('❌ MAIL_TRIGGER_CRITICAL_FAILURE:', error);
      // We don't crash the app here so the user is still created, 
      // but we see why the email didn't send.
    }

    const { password, ...result } = newUser;
    
    return {
      message: 'RECRUIT_SYNC_COMPLETE. CHECK_INBOX_FOR_ACTIVATION.',
      user: result,
    };
  }
  
  // Verification logic adapted for Prisma
  async verifyEmail(token: string) {
    // Find user with the matching token
    const user = await this.prisma.user.findFirst({ 
      where: { verificationToken: token } 
    });

    if (!user) {
      throw new BadRequestException('INVALID_OR_EXPIRED_TOKEN');
    }

    // Update user status
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null, // Clear token after use
      },
    });

    return { 
      status: 'IDENTITY_CONFIRMED', 
      email: updatedUser.email 
    };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return { message: 'RECOVERY_LINK_SENT_IF_ACCOUNT_EXISTS' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 Hour

    await this.prisma.user.update({
      where: { email },
      data: { 
        resetToken, 
        resetTokenExpires: expires 
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await this.mailService.sendPasswordResetEmail(user.email, resetUrl);

    return { message: 'RECOVERY_PROTOCOL_INITIATED' };
  }

  async resetPassword(resetDto: { token: string; newPassword: string }) {
  const { token, newPassword } = resetDto;

  // 1. Find user by token AND check if it's still valid (not expired)
  const user = await this.prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: {
        gt: new Date(), // "gt" means Greater Than (current time)
      },
    },
  });

  if (!user) {
    // SECURITY: Use a generic error so we don't reveal WHY it failed
    throw new BadRequestException('INVALID_OR_EXPIRED_RECOVERY_TOKEN');
  }

  // 2. Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // 3. Update user and CLEAR the reset fields so the token can't be used again
  await this.prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  return { 
    status: 'CREDENTIALS_REGENERATED', 
    message: 'You may now sign in with your new password.' 
  };
}
  
}