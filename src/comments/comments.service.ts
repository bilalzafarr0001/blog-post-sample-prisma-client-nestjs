import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

const authorSelect = { select: { id: true, name: true, email: true } };

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCommentDto, authorId: string) {
    return this.prisma.comment.create({
      data: { ...dto, authorId },
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

  async update(id: string, dto: UpdateCommentDto, userId: string) {
    await this.ensureOwnership(id, userId);
    return this.prisma.comment.update({
      where: { id },
      data: dto,
      include: { author: authorSelect },
    });
  }

  async remove(id: string, userId: string) {
    await this.ensureOwnership(id, userId);
    await this.prisma.comment.delete({ where: { id } });
    return { id };
  }

  private async ensureOwnership(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only modify your own comments');
    }
    return comment;
  }
}
