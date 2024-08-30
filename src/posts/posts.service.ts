import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from 'src/users/entities/user.entity';
import { Comment } from 'src/comments/entities/comment.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async create(createPostDto: CreatePostDto, authorId: number): Promise<Post> {
    const author = await this.usersRepository.findOne({
      where: { id: authorId },
    });
    const post = this.postsRepository.create({
      ...createPostDto,
    });
    post.author = author;
    return this.postsRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({
      relations: {
        author: true,
      },
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: {
        author: true,
        comments: {
          author: true,
        },
      },
    });
    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }
    return {
      ...post,
    };
  }

  async update(
    id: number,
    updatePostDto: Partial<CreatePostDto>,
  ): Promise<Post> {
    await this.postsRepository.update(id, updatePostDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['comments'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    if (post.comments && post.comments.length > 0) {
      await this.commentRepository.remove(post.comments);
    }

    const result = await this.postsRepository.remove(post);
    if (!result) {
      throw new NotFoundException(`Failed to delete post with ID "${id}"`);
    }
  }
}
