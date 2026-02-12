import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import * as PrismaClient from '@prisma/client';
import { User } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

async purgeAccount(id: string) {
  // 1. Find the user first to get their image filename
  const user = await this.prisma.user.findUnique({ where: { id } });

  if (user && user.image) {
    try {
      // ✅ FIX: Use process.cwd() instead of __dirname
      const imagePath = join(process.cwd(), 'uploads', user.image);
      await unlink(imagePath); 
    } catch (err) {
      console.error("IMAGE_DELETION_FAILED:", err);
      // We don't stop the purge if the file is already missing
    }
  }

  // 2. Delete the user record
  return await this.prisma.user.delete({ where: { id } });
}

  // 1. Create a new user
  async createUser(data: PrismaClient.Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.prisma.user.create({
        data,
      });
    } catch (error) {
      // Catch Prisma-specific unique constraint error (P2002)
      if (
        error instanceof PrismaClient.Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A user with this email already exists.');
      }
      throw error;
    }
  }

  // 2. Find all users
  async findAllUsers() {
    return this.prisma.user.findMany({
      // include: { trainingPlans: true },
    });
  }

  // 3. Find a single user by ID
  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      // include: { trainingPlans: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // 4. Update user data
  async updateUser(
    id: string,
    data: PrismaClient.Prisma.UserUpdateInput,
  ): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof PrismaClient.Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }

  // 5. Delete a user
  async deleteUser(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

    async updateProfilePicture(userId: string, filePath: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { image: filePath },
    });
  }

  async findUserByEmail(email: string) {
  return this.prisma.user.findUnique({
    where: { email },
  });
}

  async updateProfile(userId: string, updateData: any, filePath?: string): Promise<User> {
  const data: any = {
    firstName: updateData.firstName,
    lastName: updateData.lastName,
    mobile: updateData.mobile,
    username: updateData.username,
    password: updateData.password,
    email: updateData.email,
  };

  // Only update the image field if a new file was actually uploaded
  if (filePath) {
    data.image = filePath;
  }

  return this.prisma.user.update({
    where: { id: userId },
    data,
  });
}
}
