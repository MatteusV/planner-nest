import { Module } from '@nestjs/common';
import { LinksService } from './links.service';
import { LinksController } from './links.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [LinksController],
  providers: [LinksService],
  imports: [PrismaModule],
})
export class LinksModule {}
