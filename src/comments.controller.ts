import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Commentary } from './comments.entity';
import { CommentsService } from './comments.service';
import { CommentaryDto } from './dto/commentary.dto';
import { GetCommentDto } from './dto/get-comment.dto';
import { DeleteResult } from 'typeorm';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @MessagePattern({ cmd: 'createComment' })
  async createComment(
    @Payload() data: { dto: CommentaryDto },
  ): Promise<Commentary> {
    return await this.commentsService.createComment(data.dto);
  }

  @MessagePattern({ cmd: 'deleteComment' })
  async deleteComment(
    @Payload() data: { commentId: number },
  ): Promise<DeleteResult> {
    return await this.commentsService.deleteComment(data.commentId);
  }
  @MessagePattern({ cmd: 'deleteCommentsFromEssence' })
  async deleteCommentsFromEssence(
    @Payload() data: { dto: GetCommentDto },
  ): Promise<{
    deletedComments: number;
  }> {
    return await this.commentsService.deleteCommentsFromEssence(data.dto);
  }

  @MessagePattern({ cmd: 'updateComment' })
  async editComment(
    @Payload() data: { commentId: number; dto: CommentaryDto },
  ): Promise<DeleteResult> {
    return await this.commentsService.editComment(data.commentId, data.dto);
  }

  @MessagePattern({ cmd: 'getComments' })
  async getComments(
    @Payload() data: { dto: GetCommentDto },
  ): Promise<Commentary[]> {
    return await this.commentsService.getComments(data.dto);
  }
  @MessagePattern({ cmd: 'getCommentsTree' })
  async getCommentsTree(
    @Payload() data: { dto: GetCommentDto },
  ): Promise<Commentary[]> {
    return await this.commentsService.getCommentsTree(data.dto);
  }
  @MessagePattern({ cmd: 'getCommentById' })
  async getCommentById(
    @Payload() data: { commentId: number },
  ): Promise<Commentary> {
    return await this.commentsService.getCommentById(data.commentId);
  }
}
