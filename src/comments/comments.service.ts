import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    authorId: number,
  ): Promise<Comment> {
    const user = await this.userRepository.findOne({ where: { id: authorId } });
    const post = await this.postRepository.findOne({
      where: { id: createCommentDto.postId },
    });
    const comment = this.commentsRepository.create({
      ...createCommentDto,
    });
    comment.author = user;
    comment.post = post;
    return this.commentsRepository.save(comment);
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }
    return comment;
  }

  async update(
    id: number,
    updateCommentDto: Partial<CreateCommentDto>,
  ): Promise<Comment> {
    await this.commentsRepository.update(id, updateCommentDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.commentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }
  }

  async likeComment(id: number): Promise<Comment> {
    const comment = await this.findOne(id);
    comment.likes += 1;
    return this.commentsRepository.save(comment);
  }
}
