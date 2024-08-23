import { Prisma } from '@prisma/client';

export class CreateUserDto implements Prisma.UserCreateInput {
  id?: string;
  name: string;
  email: string;
  password: string;
  image_url?: string;
  trips?: Prisma.TripCreateNestedManyWithoutUserInput;
  Message?: Prisma.MessageCreateNestedManyWithoutUserInput;
}
