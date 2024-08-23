import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [MessagesGateway, MessagesService],
  imports: [PrismaModule, JwtModule],
})
export class MessagesModule {}
