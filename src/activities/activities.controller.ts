import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { Public } from 'src/constant';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Public()
  @Post(':tripId/trip')
  create(
    @Body() createActivityDto: CreateActivityDto,
    @Param('tripId') tripId: string,
  ) {
    return this.activitiesService.create(createActivityDto, tripId);
  }

  @Public()
  @Get(':tripId/trip')
  findAll(@Param('tripId') tripId: string) {
    return this.activitiesService.findAll(tripId);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}
