import { Test, TestingModule } from '@nestjs/testing';
import {
  TypeOrmModule,
} from '@nestjs/typeorm';
import { TypeORMTestingModule } from './test-utils/TypeORMTestingModule';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Commentary } from './comments.entity';
import { Repository } from 'typeorm';
import { CommentaryDto } from './dto/commentary.dto';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GetCommentDto } from './dto/get-comment.dto';
describe('comments Controller Integration', () => {
  let controller: CommentsController;
  let service: CommentsService;
  let repository: Repository<Commentary>;

  // Connect to db
  beforeAll(async () => {
    const commentsModule: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `.${process.env.NODE_ENV}.env`,
        }),

        TypeORMTestingModule([Commentary]),
        TypeOrmModule.forFeature([Commentary]),

        ClientsModule.registerAsync([
          {
            name: 'TO_PROFILES_MS',
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.get<string>('RMQ_URL')],
                queue: 'toProfilesMs',
                queueOptions: {
                  durable: false,
                },
              },
            }),
            inject: [ConfigService],
            imports: [ConfigModule],
          },
        ]),
      ],
      providers: [CommentsService],
      controllers: [CommentsController],
    }).compile();

    controller = commentsModule.get<CommentsController>(CommentsController);
    service = commentsModule.get<CommentsService>(CommentsService);
    repository = await service.getRepository();

    const app = commentsModule.createNestApplication();
    const connection = repository.manager.connection;
    await connection.synchronize(true);
    await app.init();
  });

  describe('createComment() - create new comment in DB', () => {
    const createCommentPayload: { dto: CommentaryDto } = {
      dto: {
        author: { userId: 1, name: 'string' },
        text: 'test comment',
        essenceTable: 'movies',
        essenceId: 1,
      },
    };
    it('create new comment with correct properties', async () => {
      const commentCreateResult = await controller.createComment(
        createCommentPayload,
      );
      const commentId: number = commentCreateResult.id;
      const commentFromDb: Commentary = await repository.findOneBy({
        id: commentId,
      });
      await repository.delete({ id: commentId });
      expect(commentFromDb.essenceId).toEqual(
        createCommentPayload.dto.essenceId.toString(),
      );
      expect(commentFromDb.essenceTable).toEqual(
        createCommentPayload.dto.essenceTable,
      );
      expect(commentFromDb.text).toEqual(createCommentPayload.dto.text);
      expect(commentFromDb.userId).toEqual(
        createCommentPayload.dto.author.userId.toString(),
      );
    });
    it('create nested comment', async () => {
      const createdCommentIds: number[] = [];
      const commentCreateResult = await controller.createComment(
        createCommentPayload,
      );
      const commentId: number = commentCreateResult.id;
      createdCommentIds.push(commentId);

      const createNestedCommentPayload: { dto: CommentaryDto } = {
        dto: {
          author: { userId: 5, name: 'string' },
          text: 'nested test comment',
          essenceTable: 'comments',
          essenceId: commentId,
        },
      };

      jest.spyOn(service, 'getCommentAuthor').mockImplementation(async () => {
        return {
          userId: createNestedCommentPayload.dto.author.userId,
          name: createNestedCommentPayload.dto.author.name,
        };
      });

      const nestedCommentResult = await controller.createComment(
        createNestedCommentPayload,
      );
      createdCommentIds.push(nestedCommentResult.id);
      const getCommentsPayload: { dto: GetCommentDto } = {
        dto: {
          essenceTable: createCommentPayload.dto.essenceTable,
          essenceId: createCommentPayload.dto.essenceId,
        },
      };
      const commentTree = await controller.getCommentsTree(getCommentsPayload);
      //console.log(commentTree);
      await repository.delete(createdCommentIds);
      expect(commentTree[0]['comments'][0].author.userId).toEqual(
        createNestedCommentPayload.dto.author.userId,
      );
      expect(commentTree[0]['comments'][0].text).toEqual(
        createNestedCommentPayload.dto.text,
      );
      expect(commentTree[0]['comments'][0].essenceTable).toEqual(
        createNestedCommentPayload.dto.essenceTable,
      );
      expect(commentTree[0]['comments'][0].essenceId).toEqual(
        createNestedCommentPayload.dto.essenceId.toString(),
      );
    });
  });
  describe('delete comments', () => {
    const createCommentDto: CommentaryDto = {
      author: { userId: 1, name: 'string' },
      text: 'test comment',
      essenceTable: 'movies',
      essenceId: 2,
    };
    it('delete comment by id', async () => {
      const commentInsertResult = await repository.insert({
        ...createCommentDto,
        userId: createCommentDto.author.userId,
      });
      const commentId = commentInsertResult.raw[0].id;
      await controller.deleteComment({ commentId });
      const existingComment = await repository.findOneBy({ id: commentId });
      expect(existingComment).toBeNull();
    });
    it('delete comments by essence', async () => {
      await repository.insert({
        ...createCommentDto,
        userId: createCommentDto.author.userId,
      });
      await repository.insert({
        ...createCommentDto,
        userId: 5,
      });
      await controller.deleteCommentsFromEssence({
        dto: {
          essenceTable: createCommentDto.essenceTable,
          essenceId: createCommentDto.essenceId,
        },
      });
      const existingComments = await repository.findBy({
        essenceTable: createCommentDto.essenceTable,
        essenceId: createCommentDto.essenceId,
      });
      //console.log(existingComments);
      expect(existingComments).toEqual([]);
    });
  });
  describe('other comments controller methods', () => {
    it('get comments', async () => {
      const createCommentDto: CommentaryDto = {
        author: { userId: 1, name: 'string' },
        text: 'test comment',
        essenceTable: 'movies',
        essenceId: 3,
      };
      await repository.insert({
        ...createCommentDto,
        userId: createCommentDto.author.userId,
      });
      const comments = await controller.getComments({
        dto: {
          essenceTable: createCommentDto.essenceTable,
          essenceId: createCommentDto.essenceId,
        },
      });
      //console.log(comments);
      expect(comments[0].text).toEqual(createCommentDto.text);
      expect(comments[0].userId).toEqual(
        createCommentDto.author.userId.toString(),
      );
      expect(comments[0].essenceId).toEqual(
        createCommentDto.essenceId.toString(),
      );
      expect(comments[0].essenceTable).toEqual(createCommentDto.essenceTable);
    });
    it('update comment', async () => {
      const createCommentDto: CommentaryDto = {
        author: { userId: 1, name: 'string' },
        text: 'test comment',
        essenceTable: 'movies',
        essenceId: 4,
      };
      const updateCommentDto: CommentaryDto = {
        author: { userId: 2, name: 'string' },
        text: 'updated comment',
        essenceTable: 'comments',
        essenceId: 6,
      };
      const insertResult = await repository.insert({
        ...createCommentDto,
        userId: createCommentDto.author.userId,
      });
      const commentId = insertResult.raw[0].id;
      await controller.editComment({ commentId, dto: updateCommentDto });
      const updatedComment = await repository.findOneBy({ id: commentId });
      expect(updatedComment.essenceTable).toEqual(
        updateCommentDto.essenceTable,
      );
      expect(updatedComment.essenceId).toEqual(
        updateCommentDto.essenceId.toString(),
      );
      expect(updatedComment.text).toEqual(updateCommentDto.text);
      expect(updatedComment.userId).toEqual(
        updateCommentDto.author.userId.toString(),
      );
    });
    it('get comment by id', async () => {
      const createCommentDto: CommentaryDto = {
        author: { userId: 1, name: 'string' },
        text: 'test comment',
        essenceTable: 'movies',
        essenceId: 5,
      };
      const insertResult = await repository.insert({
        ...createCommentDto,
        userId: createCommentDto.author.userId,
      });
      const commentId = insertResult.raw[0].id;
      const comment = await controller.getCommentById({ commentId });
      expect(comment.text).toEqual(createCommentDto.text);
      expect(comment.userId).toEqual(createCommentDto.author.userId.toString());
      expect(comment.essenceTable).toEqual(createCommentDto.essenceTable);
      expect(comment.essenceId).toEqual(createCommentDto.essenceId.toString());
    });
  });
});
