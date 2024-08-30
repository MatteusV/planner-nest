export class CreateMessageDto {
  content: string;
  participant_id?: string;
  user_id?: string;
  trip_id: string;
}
