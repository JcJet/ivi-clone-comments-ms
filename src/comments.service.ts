import {HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Commentary} from './comments.entity';
import {CommentaryDto} from './dto/commentary.dto';
import {GetCommentDto} from './dto/get-comment.dto';
import {ClientProxy} from '@nestjs/microservices';
import {lastValueFrom} from "rxjs";

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Commentary)
    private commentsRepository: Repository<Commentary>,
    @Inject('TO_PROFILES_MS') private toProfilesProxy: ClientProxy,
  ) {}
  //TODO: подумать, как сделать красивее эти movieId/commentId, когда с фронтом все будет окончательно решено
  essenceToField(essenceTable: string, essenceId: number) {
    if (essenceTable == 'movies') {
      return { movieId: essenceId };
    }
    if (essenceTable == 'comments') {
      return { commentId: essenceId };
    }
  }

  async createComment(dto: CommentaryDto): Promise<Commentary> {
    dto['userId'] = dto.author.userId;
    const commentInsertResult = await this.commentsRepository.insert(dto);
    return commentInsertResult.raw[0];
  }

  async editComment(id: number, dto: CommentaryDto): Promise<any> {
    dto['userId'] = dto.author.userId;
    delete dto.author;
    return await this.commentsRepository.update(id, dto);
  }

  async deleteComment(id: number): Promise<any> {
    await this.deleteCommentsFromEssence({
      essenceTable: 'comments',
      essenceId: id,
    });
    return await this.commentsRepository.delete(id);
  }

  async getComments(dto: GetCommentDto) {
    const comments = await this.commentsRepository.find({ where: { ...dto } });
    for (const comment of comments) {
      comment['author'] = await this.getCommentAuthor(comment);
    }
    return comments;
  }
  async getCommentAuthor(comment: Commentary) {
    const profileAuthor = await lastValueFrom(
      this.toProfilesProxy.send(
        { cmd: 'getProfileByUserId' },
        { userId: comment.userId },
      ),
    );
    return {
      userId: comment.userId,
      name: `${profileAuthor?.firstName} ${profileAuthor?.lastName}`,
    };
  }
  async getNestedComments(
    comments: Commentary[],
    deleteFoundComments = false,
    addditionalFields = true,
  ) {
    for (const comment of comments) {
      const nestedComments = await this.getComments({
        essenceTable: 'comments',
        essenceId: comment.id,
      });
      comment['comments'] = nestedComments;
      if (addditionalFields) {
        comment['author'] = await this.getCommentAuthor(comment);
        //TODO: убрать idField, если фронт его не будет юзать (добавлено, т.к. нужны были такие квери-параметры,
        // на случай если и поля такие же понадобятся)
        const idField = this.essenceToField(
          comment.essenceTable,
          comment.essenceId,
        );
        comment[Object.keys(idField)[0]] = idField[Object.keys(idField)[0]];
      }
      if (nestedComments.length != 0) {
        await this.getNestedComments(nestedComments);
      }
      if (deleteFoundComments) {
        await this.commentsRepository.delete(comment.id);
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
    const rootComments = await this.getComments(dto);
    const deletedComments = this.getNestedComments(rootComments, true);
    await this.commentsRepository.delete({ ...dto });
    return deletedComments;
  }
}
