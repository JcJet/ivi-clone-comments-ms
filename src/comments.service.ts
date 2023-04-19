import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Commentary } from "./comments.entity";
import { CommentaryDto } from "./dto/commentary.dto";
import { GetCommentaryDto } from "./dto/getCommentary.dto";

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Commentary)
    private commentsRepository: Repository<Commentary>,
  ) {}
  async createComment(dto: CommentaryDto): Promise<Commentary> {
    //const commentInsertResult = await this.commentsRepository.insert(dto);
    const commentInsertResult = await this.commentsRepository.insert(dto);
    return commentInsertResult.raw[0];
  }

  async editComment(id: number, dto: CommentaryDto): Promise<any> {
    const commentUpdateResult = await this.commentsRepository.update(id, dto);
    return commentUpdateResult;
  }

  async deleteComment(id: number): Promise<any> {
    const commentDeleteResult = await this.commentsRepository.delete(id);
    return commentDeleteResult;
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
    essenceTable: string,
    essenceId: number,
  ): Promise<Commentary[]> {
    const deleteResult = await this.commentsRepository
      .createQueryBuilder()
      .delete()
      .where('essenceTable = :table', { essenceTable })
      .andWhere('essenceId = :id', { essenceId })
      .returning('*')
      .execute();
    return deleteResult.raw[0];
  }
}
