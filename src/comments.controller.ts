import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Commentary } from './comments.entity';
import { CommentsService } from './comments.service';
import { CommentaryDto } from './dto/commentary.dto';
import { GetCommentaryDto } from './dto/getCommentary.dto';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @MessagePattern('createComment')
  async createComment(
    @Payload() data: { dto: CommentaryDto },
  ): Promise<Commentary> {
    return await this.commentsService.createComment(data.dto);
  }

  @MessagePattern('deleteComment')
  async deleteComment(@Payload() data: { id: number }): Promise<any> {
    return await this.commentsService.deleteComment(data.id);
  }

  @MessagePattern('editComment')
  async editComment(
    @Payload() data: { id: number; dto: CommentaryDto },
  ): Promise<any> {
    return await this.commentsService.editComment(data.id, data.dto);
  }

  @MessagePattern('getComments')
  async getComments(
    @Payload() data: { dto: GetCommentaryDto },
  ): Promise<Commentary[]> {
    return await this.commentsService.getComments(data.dto);
  }
  @MessagePattern('getCommentsTree')
  async getCommentsTree(
    @Payload() data: { dto: GetCommentaryDto },
  ) {
    let comments = await this.commentsService.getComments(data.dto);
    for (let comment of comments) {
      //TODO: сделать рекурсивно
    }
    //const ivi-clone-comments-ms: await this.commentsService.getComments({essenceTable: ivi-clone-comments-ms, essenceId: rootComment.id});
  }
}
