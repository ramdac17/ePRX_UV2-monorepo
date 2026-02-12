import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserService, 
    PrismaService // ✅ Injecting the service we've been fixing
  ],
  exports: [UserService], // Exporting if other modules need to find users
})
export class UserModule {}