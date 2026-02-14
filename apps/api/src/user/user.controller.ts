import { 
  Controller, Post, Get, UseInterceptors, 
  UploadedFile, Param, Query, BadRequestException, Body, Delete, UseGuards, Request as NestRequest, UnauthorizedException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Request } from 'express'; // Keep only this for the type
import { UserService } from './user.service.js'; // Removed .js for standard TS
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js'; // Removed .js

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  // FIX: Type 'req' as 'Request' and use 'NestRequest' decorator alias to avoid conflict
  async remove(@Param('id') id: string, @NestRequest() req: Request) {
    
    // Safety check: Ensure the authenticated user matches the target ID
    // Note: Passport attaches the user to req.user. We cast to 'any' for quick access
    const user = req.user as any;
    if (user.id !== id) {
      throw new UnauthorizedException('PURGE_DENIED: UNAUTHORIZED_TARGET');
    }

    await this.userService.purgeAccount(id);
    return { 
      status: 'PURGE_COMPLETE', 
      message: 'ALL_DATA_ERASED_FROM_EPRX_UV1' 
    };
  }

  @Get('profile')
  async getProfile(@Query('id') id: string) {
    if (!id) throw new BadRequestException('User ID is required');
    const user = await this.userService.findUserById(id);
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,  
      mobile: user.mobile,
      image: user.image, 
    };
  }

  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'), 
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `image-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return callback(new BadRequestException('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  }))
  async uploadFile(
    @Param('id') id: string, 
    // Express.Multer.File is the correct type here
    @UploadedFile() file: Express.Multer.File | undefined, 
    @Body() body: any 
  ) {
    const imagePath = file ? file.filename : undefined;

    const updatedUser = await this.userService.updateProfile(id, body, imagePath);
    
    return {
      message: 'PROFILE_SYNC_SUCCESSFUL',
      image: updatedUser.image,
      user: updatedUser,
    };
  }
}