import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  imports: [PrismaModule],
})
export class ActivitiesModule {}
