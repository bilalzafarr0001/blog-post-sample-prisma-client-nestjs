import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

const authorSelect = { select: { id: true, name: true, email: true } };

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: dto,
      include: { author: authorSelect },
    });
  }

  findAllForPost(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      include: { author: authorSelect },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: { author: authorSelect },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return comment;
  }

  async update(id: string, dto: UpdateCommentDto) {
    await this.ensureExists(id);
    return this.prisma.comment.update({
      where: { id },
      data: dto,
      include: { author: authorSelect },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.comment.delete({ where: { id } });
    return { id };
  }

  private async ensureExists(id: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return comment;
  }
}
