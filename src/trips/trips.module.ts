import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/auth.guard';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [TripsController],
  providers: [
    TripsService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [PrismaModule],
})
export class TripsModule {}
