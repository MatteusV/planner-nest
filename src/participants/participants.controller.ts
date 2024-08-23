import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { Public } from 'src/constant';
import { Response } from 'express';
import { env } from 'process';

@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post('create/:tripId/trip')
  create(
    @Body() createParticipantDto: CreateParticipantDto,
    @Param('tripId') tripId: string,
  ) {
    return this.participantsService.create(createParticipantDto, tripId);
  }

  @Public()
  @Get('fetch/:tripId/trip')
  findAllByTripId(@Param('tripId') tripId: string) {
    return this.participantsService.findAllByTripId(tripId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.participantsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.participantsService.remove(id);
  }

  @Public()
  @Get(':id/confirm')
  async confirm(@Param('id') id: string, @Res() response: Response) {
    const { tripId } = await this.participantsService.confirm(id);

    return response.status(304).redirect(`${env.WEB_BASE_URL}/trips/${tripId}`);
  }
}
