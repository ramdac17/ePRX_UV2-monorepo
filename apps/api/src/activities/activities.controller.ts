import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { ActivitiesService } from './activities.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async uploadActivity(@Req() req: any, @Body() body: any) {
    // req.user.id comes from your JWT guard
    return this.activitiesService.createActivity(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(@Req() req: any) {
    return this.activitiesService.getDashboardStats(req.user.id);
  }
}
