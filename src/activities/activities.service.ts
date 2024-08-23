import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import dayjs from 'dayjs';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(createActivityDto: CreateActivityDto, tripId: string) {
    const occursAtFormatted = dayjs(createActivityDto.occurs_at).toDate();
    const activity = await this.prisma.activity.create({
      data: {
        occurs_at: occursAtFormatted,
        title: createActivityDto.title,
        trip_id: tripId,
      },
    });

    if (!activity) {
      throw new BadRequestException();
    }

    return { activity };
  }

  async findAll(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        activities: {
          orderBy: {
            occurs_at: 'asc',
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found.');
    }

    const differenceInDaysBetweenTripStartAndEnd = dayjs(trip.ends_at).diff(
      trip.starts_at,
      'days',
    );

    const activities = Array.from({
      length: differenceInDaysBetweenTripStartAndEnd + 1,
    }).map((_value, index) => {
      const date = dayjs(trip.starts_at).add(index, 'days');

      return {
        date: date.toDate(),
        activities: trip.activities.filter((activity) => {
          return dayjs(activity.occurs_at).isSame(date, 'day');
        }),
      };
    });
    return { activities };
  }

  async remove(id: string) {
    try {
      await this.prisma.activity.delete({
        where: {
          id,
        },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException('Activity not found.');
      }
    }
  }
}
