import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TripsModule } from './trips/trips.module';
import { ParticipantsModule } from './participants/participants.module';
import { SupabaseModule } from './supabase/supabase.module';
import { MessagesModule } from './messages/messages.module';
import { LinksModule } from './links/links.module';
import { ActivitiesModule } from './activities/activities.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    TripsModule,
    ParticipantsModule,
    SupabaseModule,
    MessagesModule,
    LinksModule,
    ActivitiesModule,
  ],
})
export class AppModule {}
