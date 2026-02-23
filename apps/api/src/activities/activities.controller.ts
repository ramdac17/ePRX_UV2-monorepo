import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get('stats')
  async getStats(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.activitiesService.getDashboardStats(userId);
  }

  @Get()
  async findAll(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.activitiesService.findAll(userId);
  }

  @Post()
  async uploadActivity(@Req() req: any, @Body() body: any) {
    const userId = req.user.id || req.user.sub;
    return this.activitiesService.createActivity(userId, body);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }
}
