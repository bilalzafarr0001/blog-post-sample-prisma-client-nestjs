import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePostDto) {
    return this.prisma.post.create({
      data: dto,
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  findAll(published?: boolean) {
    return this.prisma.post.findMany({
      where: published === undefined ? undefined : { published },
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return post;
  }

  async update(id: string, dto: UpdatePostDto) {
    await this.ensureExists(id);
    return this.prisma.post.update({
      where: { id },
      data: dto,
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.post.delete({ where: { id } });
    return { id };
  }

  private async ensureExists(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return post;
  }
}
