import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    console.log('--- [ePRX_UV1] FETCHING_HISTORY_FOR_USER:', userId);
    return this.prisma.activity.findMany({
      where: {
        userId: userId, // Ensure this matches your Prisma schema field name
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async getDashboardStats(userId: string) {
    const activities = await this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const totals = activities.reduce(
      (acc, curr) => ({
        distance: acc.distance + curr.distance,
        duration: acc.duration + curr.duration,
      }),
      { distance: 0, duration: 0 },
    );

    return {
      recent: activities.slice(0, 7), // Last 7 for the chart
      summary: {
        totalDistance: totals.distance.toFixed(2),
        totalHours: (totals.duration / 3600).toFixed(1),
        activityCount: activities.length,
      },
    };
  }

  async createActivity(userId: string, data: any) {
    return this.prisma.activity.create({
      data: {
        title: data.title,
        distance: parseFloat(data.distance),
        duration: parseInt(data.duration),
        pace: data.pace,
        elevation: parseFloat(data.elevation),
        coordinates: JSON.parse(data.coordinates), // Store as JSONB
        userId: userId,
      },
    });
  }
  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return activity;
  }
}
