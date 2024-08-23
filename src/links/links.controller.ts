import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { Request } from 'express';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post(':tripId/trip')
  create(
    @Body() createLinkDto: CreateLinkDto,
    @Param('tripId') tripId: string,
    @Req() request: Request,
  ) {
    const token = request.cookies['@planner:tokenJwt'];
    if (!token) {
      return this.linksService.create(createLinkDto, tripId);
    }

    return this.linksService.create(createLinkDto, tripId, token);
  }

  @Get(':tripId/trip')
  findAll(@Param('tripId') tripId: string) {
    return this.linksService.findAll(tripId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.linksService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.linksService.remove(id);
  }
}
