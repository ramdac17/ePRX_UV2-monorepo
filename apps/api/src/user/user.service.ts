import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { Prisma, User } from '@prisma/client'; 
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    try {
      console.log('📡 PRISMA_ATTEMPT_CREATE:', data.email);
      return await this.prisma.user.create({ data });
    } catch (error) {
      // 1. Log the full error to your NestJS terminal so you can see it!
      console.error('❌ PRISMA_CRITICAL_ERROR:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A user with this email or username already exists.');
        }
      }
      // If it's a 500 error, this throw passes the raw error back to the console
      throw error; 
    }
  }

  async purgeAccount(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (user && user.image) {
      try {
        const imagePath = join(process.cwd(), 'uploads', user.image);
        await unlink(imagePath); 
      } catch (err) {
        console.error("IMAGE_DELETION_FAILED:", err);
      }
    }
    return await this.prisma.user.delete({ where: { id } });
  }

  // ... rest of your methods remain solid
  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateProfile(userId: string, updateData: any, filePath?: string): Promise<User> {
    const data: any = { ...updateData };
    if (filePath) data.image = filePath;

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}