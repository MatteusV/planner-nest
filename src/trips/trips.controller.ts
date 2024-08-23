import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { RequestAuth } from 'src/@types/request-auth';
import { Response } from 'express';
import { env } from '../env/index';
import { Public } from 'src/constant';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerifyParticipantDto } from './dto/verify-participant.dto';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  create(@Body() createTripDto: CreateTripDto, @Req() request: RequestAuth) {
    return this.tripsService.create(createTripDto, request.user.id);
  }

  @Get(':id/confirm')
  async confirm(@Param('id') id: string, @Res() response: Response) {
    const { tripId } = await this.tripsService.confirm(id);

    return response.status(302).redirect(`${env.WEB_BASE_URL}/trips/${tripId}`);
  }

  @Get()
  findAll(@Req() request: RequestAuth) {
    const { user } = request;
    return this.tripsService.findAll(user.id);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.tripsService.uploadImage(id, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tripsService.remove(id);
  }

  @Public()
  @Post('verify/participant/:id')
  verifyParticipant(
    @Param('id') id: string,
    @Body() verifyParticipantDto: VerifyParticipantDto,
  ) {
    return this.tripsService.verifyParticipant(id, verifyParticipantDto);
  }
}
