import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { formattedDate } from 'src/utils/formatted-date';
import { env } from '../env/index';
import { getEmailClient } from 'src/lib/mail';
import nodemailer from 'nodemailer';

@Injectable()
export class ParticipantsService {
  constructor(private prisma: PrismaService) {}

  async create({ email, name }: CreateParticipantDto, tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found.');
    }

    const participantAlreadyExist = await this.prisma.participant.findUnique({
      where: {
        email_trip_id: { email, trip_id: tripId },
      },
    });

    if (participantAlreadyExist) {
      throw new ConflictException('Participante already exist.');
    }

    const participant = await this.prisma.participant.create({
      data: {
        trip_id: tripId,
        email,
        name,
      },
    });

    if (!participant) {
      throw new BadRequestException();
    }

    const { formattedEndDate, formattedStartDate } = formattedDate({
      ends_at: trip.ends_at,
      starts_at: trip.starts_at,
    });

    const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`;

    const mail = await getEmailClient();

    const message = await mail.sendMail({
      from: {
        name: 'Equipe plann.er',
        address: 'oi@plann.er',
      },
      to: {
        name: name,
        address: email,
      },

      subject: `Confirme sua viagem para ${trip.destination}`,
      html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>Você solicitou a criação de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
          <p></p>
          <p>Para confirmar sua viagem, clique no link abaixo:</p>
          <p></p>
          <p>
            <a href="${confirmationLink}">Confirmar viagem</a>
          </p>
          <p></p>
          <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
        </div>
      `.trim(),
    });

    console.log(nodemailer.getTestMessageUrl(message));

    return { participant };
  }

  async findAllByTripId(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: { participants: true },
    });

    if (!trip) {
      throw new NotFoundException('Participants not found.');
    }

    return { participants: trip.participants };
  }

  async findOne(id: string) {
    const participant = await this.prisma.participant.findUnique({
      where: {
        id,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found.');
    }

    return { participant };
  }

  async remove(id: string) {
    try {
      await this.prisma.participant.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2023') {
          throw new NotFoundException('Participant not found');
        }
      }
      console.log({ error });
      throw error;
    }
  }

  async confirm(id: string) {
    const participant = await this.prisma.participant.update({
      where: {
        id,
      },
      data: {
        is_confirmed: true,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found.');
    }

    if (participant.is_confirmed !== true) {
      throw new ConflictException('Failed updating');
    }

    return {
      tripId: participant.trip_id,
    };
  }
}
