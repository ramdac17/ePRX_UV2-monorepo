import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
  Get,
  HttpCode,
  Body,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import 'multer';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
  async register(@Body() registerDto: any) {
    console.log('--- [ePRX_UV1] REGISTRATION_ATTEMPT ---', registerDto.email);
    try {
      const result = await this.authService.register(registerDto);
      console.log(`--- [ePRX_UV1] REG_SUCCESS: ${registerDto.email} ---`);
      return result;
    } catch (error: any) {
      console.error('--- [ePRX_UV1] REG_FAILURE ---', error.message);
      // NestJS will automatically send the right status code if authService throws a ConflictException or similar
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    // CRITICAL FIX: Don't just return req.user (it's only JWT data).
    // Use the service to fetch the LATEST data from the DB, including the image!
    // Note: Use 'userId' or 'sub' or 'id' depending on your JwtStrategy (usually sub or id)
    const userId = req.user.id || req.user.sub;
    return this.authService.getProfile(userId);
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new BadRequestException(
              'Only image files (jpg, jpeg, png) are allowed!',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: any, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('No file provided or invalid file type.');
    }

    const filePath = `/uploads/avatars/${file.filename}`;
    const userId = req.user.id || req.user.sub; // Ensure we match the strategy key

    try {
      await this.authService.updateUserImage(userId, filePath);

      return {
        success: true,
        message: 'IDENTITY_IMAGE_SYNCED',
        url: filePath,
      };
    } catch (error) {
      console.error('--- [ePRX_UV1] DB_UPDATE_FAILED ---', error);
      throw new BadRequestException(
        'Failed to update user profile image in database.',
      );
    }
  }
}
