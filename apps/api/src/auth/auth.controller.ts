import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import crypto from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}


  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: any) {
    return this.authService.login(loginDto);
  }

 @Post('register')
  async register(@Body() createUserDto: any) {
    // 1. Generate a secure, unique verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 2. Pass the token to the service to be saved with the new user
    return this.authService.register({
      ...createUserDto,
      verificationToken,
      isVerified: false, // Ensure they start unverified
    });
  }

  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is required.');
    }
    
    // 3. This will find the user by token and set isVerified: true
    return this.authService.verifyEmail(token);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  // 2. The Resolution: Updates the password
  @Post('reset-password')
  async resetPassword(@Body() resetDto: any) {
    return this.authService.resetPassword(resetDto);
  }
}
