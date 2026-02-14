
import { Response } from 'express';
import crypto from 'crypto';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js'; // Ensure this path is correct
import { Request as ExpressRequest } from 'express';
import { 
  Controller, Post, UseGuards, UseInterceptors, UploadedFile, Request, 
  BadRequestException, Get, Query, HttpCode, Res, Body,
  HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import 'multer';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: any) {
    console.log('--- [ePRX_UV1] LOGIN_ATTEMPT ---');
    try {
      const result = await this.authService.login(loginDto);
      console.log(`--- [ePRX_UV1] SUCCESS: ${loginDto.email} ---`);
      return result;
    } catch (error: any) {
      console.error('--- [ePRX_UV1] FAILURE ---', error.message);
      throw error;
    }
  }

  @Post('register')
  async register(@Body() createUserDto: any) {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    return this.authService.register({
      ...createUserDto,
      verificationToken,
      emailVerified: false,
    });
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      await this.authService.verifyEmail(token);
      return res.redirect('eprx://verify-success?status=confirmed');
    } catch (error) {
      return res.redirect('eprx://verify-error?status=failed');
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetDto: any) {
    return this.authService.resetPassword(resetDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: ExpressRequest & { user: any }) {
    return req.user;
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Only image files (jpg, jpeg, png) are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: any, @Request() req: ExpressRequest & { user: any }) {
    if (!file) {
      throw new BadRequestException('No file provided or invalid file type.');
    }

    const filePath = `/uploads/avatars/${file.filename}`;

    try {
      // UPDATE: req.user comes from JwtStrategy. Ensure 'id' is part of the payload.
      await this.authService.updateUserImage(req.user.id, filePath);

      return {
        success: true,
        message: 'IDENTITY_IMAGE_SYNCED',
        url: filePath
      };
    } catch (error) {
      console.error('--- [ePRX_UV1] DB_UPDATE_FAILED ---', error);
      throw new BadRequestException('Failed to update user profile image in database.');
    }
  } // <--- Added missing closing brace
}