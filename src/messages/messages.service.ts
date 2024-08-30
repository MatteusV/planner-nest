import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto) {
    const message = await this.prisma.message.create({
      data: createMessageDto,
    });

    return { message };
  }

  async findAll(tripId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        trip_id: tripId,
      },
      orderBy: {
        created_at: 'asc',
      },
      include: {
        participant: true,
        user: true,
      },
    });

    return { messages };
  }
}
