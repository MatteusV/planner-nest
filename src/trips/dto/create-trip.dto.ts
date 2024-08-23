import { Prisma } from '@prisma/client';

export class CreateTripDto implements Prisma.TripCreateInput {
  id?: string;
  destination: string;
  starts_at: string | Date;
  ends_at: string | Date;
  image_url?: string;
  image_name?: string;
  is_confirmed?: boolean;
  created_at?: string | Date;
  participants?: Prisma.ParticipantCreateNestedManyWithoutTripInput;
  activities?: Prisma.ActivityCreateNestedManyWithoutTripInput;
  links?: Prisma.LinkCreateNestedManyWithoutTripInput;
  user: Prisma.UserCreateNestedOneWithoutTripsInput;
  Message?: Prisma.MessageCreateNestedManyWithoutTripInput;
  user_id: string;

  emails_to_invite: { email: string; name: string }[];
}
