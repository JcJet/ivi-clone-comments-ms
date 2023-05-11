import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commentary } from './comments.entity';
import { CommentaryDto } from './dto/commentary.dto';
import { GetCommentaryDto } from './dto/getCommentary.dto';

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

  async getComments(dto: GetCommentaryDto) {
    //const all = await this.commentsRepository.find();
    return await this.commentsRepository
      .createQueryBuilder('comments')
      .where('comments.essenceTable = :essenceTable', dto)
      .andWhere('comments.essenceId = :essenceId', dto)
      .getMany();
  }

  async deleteCommentsFromEssence(
    dto: GetCommentaryDto,
  ): Promise<Commentary[]> {
    //TODO: test it
    const deleteResult = await this.commentsRepository
      .createQueryBuilder('comments')
      .delete()
      .where('comments.essenceTable = :essenceTable', dto)
      .andWhere('comments.essenceId = :essenceId', dto)
      .returning('*')
      .execute();
    return deleteResult.raw[0];
  }
}
