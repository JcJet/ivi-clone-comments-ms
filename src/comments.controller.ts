import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Commentary } from './comments.entity';
import { CommentsService } from './comments.service';
import { CommentaryDto } from './dto/commentary.dto';
import { GetCommentaryDto } from './dto/getCommentary.dto';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @MessagePattern('create_comment')
  async createComment(
    @Payload() data: { dto: CommentaryDto },
  ): Promise<Commentary> {
    return await this.commentsService.createComment(data.dto);
  }

  @MessagePattern('delete_comment')
  async deleteComment(@Payload() data: { id: number }): Promise<any> {
    return await this.commentsService.deleteComment(data.id);
  }

  @MessagePattern('edit_comment')
  async editComment(
    @Payload() data: { id: number; dto: CommentaryDto },
  ): Promise<any> {
    return await this.commentsService.editComment(data.id, data.dto);
  }

  @MessagePattern('get_comments')
  async getComments(
    @Payload() data: { dto: GetCommentaryDto },
  ): Promise<Commentary[]> {
    return await this.commentsService.getComments(data.dto);
  }
}
