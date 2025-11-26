import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  create(createMessageDto: { content: string }) {
    return this.prisma.message.create({
      data: createMessageDto,
    });
  }

  findAll() {
    return this.prisma.message.findMany();
  }
}