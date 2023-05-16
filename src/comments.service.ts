import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commentary } from './comments.entity';
import { CommentaryDto } from './dto/commentary.dto';
import { GetCommentDto } from './dto/get-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Commentary)
    private commentsRepository: Repository<Commentary>,
  ) {}
  async createComment(dto: CommentaryDto): Promise<Commentary> {
    const commentInsertResult = await this.commentsRepository.insert(dto);
    return commentInsertResult.raw[0];
  }

  async editComment(id: number, dto: CommentaryDto): Promise<any> {
    return await this.commentsRepository.update(id, dto);
  }

  async deleteComment(id: number): Promise<any> {
    return await this.commentsRepository.delete(id);
  }

  async getComments(dto: GetCommentDto) {
    return await this.commentsRepository.find({ where: { ...dto } });
  }

  async getNestedComments(comments: Commentary[]) {
    for (const comment of comments) {
      const nestedComments = await this.getComments({
        essenceTable: 'comments',
        essenceId: comment.id,
      });
      comment['comments'] = nestedComments;
      if (nestedComments.length != 0) {
        await this.getNestedComments(nestedComments);
      }
    }
    return comments;
  }
  // Получение комментариев с комментариями на них самих
  async getCommentsTree(dto: GetCommentDto) {
    const rootComments = await this.getComments(dto);
    return await this.getNestedComments(rootComments);
  }
  async deleteCommentsFromEssence(dto: GetCommentDto) {
    //TODO: test it
    return await this.commentsRepository.delete({ ...dto });
  }
}
