import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Public } from 'src/constant';
import { Server } from 'socket.io';
import { env } from 'src/env';

@WebSocketGateway({
  cors: {
    origin: env.WEB_BASE_URL,
  },
})
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  @Public()
  @SubscribeMessage('createMessage')
  async create(@MessageBody() createMessageDto: CreateMessageDto) {
    const { message } = await this.messagesService.create(createMessageDto);

    this.server.emit('newMessage', message);
    return { message };
  }

  @Public()
  @SubscribeMessage('findAllMessages')
  async findAll(@MessageBody() tripId: string) {
    const { messages } = await this.messagesService.findAll(tripId);
    this.server.emit('messages', messages);
    return { messages };
  }
}
