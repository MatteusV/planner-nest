import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLinkDto } from './dto/create-link.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class LinksService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(createLinkDto: CreateLinkDto, tripId: string, token?: string) {
    if (!token) {
      const link = await this.prisma.link.create({
        data: {
          owner_email: createLinkDto.owner_email,
          owner_name: createLinkDto.owner_name,
          title: createLinkDto.title,
          trip_id: tripId,
          url: createLinkDto.url,
        },
      });

      if (!link) {
        throw new BadRequestException();
      }

      return { link };
    }

    const payload = this.jwtService.verify(token);

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const link = await this.prisma.link.create({
      data: {
        owner_email: user.email,
        owner_name: user.name,
        title: createLinkDto.title,
        url: createLinkDto.url,
        trip_id: tripId,
      },
    });

    if (!link) {
      throw new BadRequestException();
    }

    return { link };
  }

  async findAll(tripId: string) {
    const links = await this.prisma.link.findMany({
      where: {
        trip_id: tripId,
      },
    });

    if (!links) {
      throw new NotFoundException('Trip dont have links');
    }

    return { links };
  }

  async findOne(id: string) {
    const link = await this.prisma.link.findUnique({
      where: {
        id,
      },
    });

    if (!link) {
      throw new NotFoundException('Link not found.');
    }

    return { link };
  }

  async remove(id: string) {
    try {
      await this.prisma.link.delete({
        where: {
          id,
        },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException('Link not found.');
      }
    }
  }
}
