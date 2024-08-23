import {
  BadRequestException,
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import dayjs from 'dayjs';
import nodemailer from 'nodemailer';
import { env } from '../env/index';
import { formattedDate } from 'src/utils/formatted-date';
import { getEmailClient } from 'src/lib/mail';
import { SupabaseClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { VerifyParticipantDto } from './dto/verify-participant.dto';

@Injectable()
export class TripsService {
  constructor(
    private prisma: PrismaService,
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient,
  ) {}

  async create(
    {
      destination,
      ends_at,
      starts_at,
      activities,
      emails_to_invite,
    }: CreateTripDto,
    userId: string,
  ) {
    const endsAtFormatted = dayjs(ends_at).toDate();
    const startsAtFormatted = dayjs(starts_at).toDate();

    if (dayjs(startsAtFormatted).isBefore(new Date())) {
      throw new BadRequestException('Invalid trip start date.');
    }

    if (dayjs(endsAtFormatted).isBefore(startsAtFormatted)) {
      throw new BadRequestException('Invalid trip end date.');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const trip = await this.prisma.trip.create({
      data: {
        destination,
        ends_at: endsAtFormatted,
        starts_at: startsAtFormatted,
        activities,
        user_id: userId,
        participants: {
          create: emails_to_invite.map((participant) => {
            return {
              email: participant.email,
              name: participant.name,
            };
          }),
        },
      },
    });

    if (!trip) {
      throw new BadRequestException();
    }

    const { formattedEndDate, formattedStartDate } = formattedDate({
      ends_at: trip.ends_at,
      starts_at: trip.starts_at,
    });

    const confirmationLink = `${env.API_BASE_URL}/trips/${trip.id}/confirm`;

    const mail = await getEmailClient();

    const message = await mail.sendMail({
      from: {
        name: 'Equipe plann.er',
        address: 'oi@plann.er',
      },
      to: {
        name: user.name,
        address: user.email,
      },

      subject: `Confirme sua viagem para ${destination}`,
      html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>Você solicitou a criação de uma viagem para <strong>${destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
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

    return { trip };
  }

  async findAll(userId: string) {
    const trips = await this.prisma.trip.findMany({
      where: {
        user_id: userId,
      },
    });

    if (!trips) {
      throw new NotFoundException(
        'The user does not participate in any trips.',
      );
    }

    return { trips };
  }

  async findOne(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: {
            occurs_at: 'asc',
          },
          select: {
            title: true,
            occurs_at: true,
            id: true,
          },
        },
        links: true,
        participants: true,
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
        activities: trip.activities
          .map((activity) => ({
            ...activity,
            has_occurred: dayjs(activity.occurs_at).isBefore(dayjs()),
          }))
          .filter((activity) => {
            return dayjs(activity.occurs_at).isSame(date, 'day');
          }),
      };
    });

    return {
      trip: {
        id: trip.id,
        destination: trip.destination,
        starts_at: trip.starts_at,
        ends_at: trip.ends_at,
        user_id: trip.user_id,
        image_url: trip.image_url,
        image_name: trip.image_name,
        participants: trip.participants,
        links: trip.links,
        activities,
      },
    };
  }

  async confirm(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        participants: {
          where: { is_confirmed: false },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found.');
    }

    const tripUpdatted = await this.prisma.trip.update({
      where: { id },
      data: {
        is_confirmed: true,
      },
    });

    if (tripUpdatted.is_confirmed !== true) {
      throw new HttpException('Not modified', HttpStatus.NOT_MODIFIED);
    }

    const { formattedEndDate, formattedStartDate } = formattedDate({
      ends_at: trip.ends_at,
      starts_at: trip.starts_at,
    });

    const mail = await getEmailClient();

    await Promise.all(
      trip.participants.map(async (participant) => {
        const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`;
        const message = await mail.sendMail({
          from: {
            name: 'Equipe plann.er',
            address: 'oi@plann.er',
          },
          to: participant.email,
          subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,
          html: `
          <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
            <p>Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>.</p>
            <p></p>
            <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
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
      }),
    );

    return { tripId: id };
  }

  async uploadImage(id: string, file: Express.Multer.File) {
    const { buffer, originalname } = file;

    const fileExtension = originalname.split('.')[1];
    const newFileName = randomBytes(16).toString('hex');
    const fileName = `${newFileName}.${fileExtension}`;

    const { data, error } = await this.supabase.storage
      .from('pictures-trips')
      .upload(fileName, buffer, { contentType: 'image/*' });

    if (error) {
      throw new BadRequestException(error.message);
    }

    const image = this.supabase.storage
      .from('pictures-trips')
      .getPublicUrl(data.path);

    try {
      await this.prisma.trip.update({
        where: {
          id,
        },
        data: {
          image_url: image.data.publicUrl,
          image_name: fileName,
        },
      });

      return { imageUrl: image.data.publicUrl };
    } catch (error) {
      await this.supabase.storage.from('pictures-trips').remove([data.path]);
      if (error instanceof PrismaClientValidationError) {
        throw new NotFoundException('Trip not found.');
      }
      console.log({ error });
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.$transaction([
        this.prisma.participant.deleteMany({
          where: {
            trip_id: id,
          },
        }),
        this.prisma.message.deleteMany({
          where: {
            trip_id: id,
          },
        }),
        this.prisma.link.deleteMany({
          where: {
            trip_id: id,
          },
        }),
        this.prisma.activity.deleteMany({
          where: {
            trip_id: id,
          },
        }),
        this.prisma.trip.delete({
          where: {
            id,
          },
        }),
      ]);
    } catch (error) {
      if (error instanceof PrismaClientValidationError) {
        throw new NotFoundException('Trip not found.');
      }

      throw new InternalServerErrorException(error);
    }
  }

  async verifyParticipant(
    id: string,
    verifyParticipantDto: VerifyParticipantDto,
  ) {
    const participant = await this.prisma.participant.findUnique({
      where: {
        email_trip_id: {
          email: verifyParticipantDto.email,
          trip_id: id,
        },
      },
    });

    if (!participant) {
      throw new UnauthorizedException('Participant is not on the trip.');
    }

    return { participant };
  }
}
