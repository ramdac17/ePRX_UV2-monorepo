import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Param,
  Query,
  BadRequestException,
  Body,
  Delete,
  UseGuards,
  Request as ReqDecorator,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from './user.interface';

// DTO for updating user profile
export class UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  // add other profile fields as needed
}

// --- Controller ---
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** DELETE: Remove user account (authenticated user only) */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Express.Request) {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user || user.id !== id) {
      throw new UnauthorizedException('PURGE_DENIED');
    }

    await this.userService.purgeAccount(id);
    return {
      status: 'PURGE_COMPLETE',
      message: 'ALL_DATA_ERASED_FROM_EPRX_UV1',
    };
  }

  /** GET: Fetch user profile by ID */
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

  /** POST: Upload user profile image */
  @Post(':id/upload-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          callback(null, `image-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (_, file, callback) => {
        if (!file.mimetype?.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
    @Body() body?: UpdateUserProfileDto,
  ) {
    const imagePath = file?.filename;

    const updatedUser = await this.userService.updateProfile(
      id,
      body ?? {},
      imagePath,
    );

    return {
      message: 'PROFILE_SYNC_SUCCESSFUL',
      image: updatedUser.image,
      user: updatedUser,
    };
  }
}
