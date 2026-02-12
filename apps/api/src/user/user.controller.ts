import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UserService } from './user.service.js';
import { 
  Controller, Post, Get, UseInterceptors, 
  UploadedFile, Param, Query, BadRequestException, Body, Delete, UseGuards, Request, UnauthorizedException // ✅ Added Body
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js'


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {

    if (req.user.id !== id) {
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
    @UploadedFile() file: Express.Multer.File, 
    @Body() body: any // ✅ This captures firstName, lastName, and mobile from FormData
  ) {
    // Logic: We no longer throw an error if !file, because the user might just be updating text
    const imagePath = file ? file.filename : undefined;

    // We pass both the text data (body) and the image (if any) to the service
    const updatedUser = await this.userService.updateProfile(id, body, imagePath);
    
    return {
      message: 'PROFILE_SYNC_SUCCESSFUL',
      image: updatedUser.image, // Return the final image name from DB
      user: updatedUser,
    };
  }
}