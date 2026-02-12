import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js'; 

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // ADD THIS METHOD:
  async createEvent(data: any) {
    // Audit log for the monorepo
    console.log('DATABASE_LOG: Storing new event...', data.title);

    return this.prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date), // Ensure date is a proper Date object
        location: data.location,
        organizer: data.organizer,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        image: data.image || null,
      },
    });
  }

  async getEvents() {
    return this.prisma.event.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async getEventById(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
    });
  }
}