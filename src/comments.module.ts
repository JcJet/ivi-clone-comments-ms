import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller';
import { Commentary } from './comments.entity';
import { CommentsService } from './comments.service';

const databaseHost = process.env.DB_HOST || 'localhost';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: databaseHost,
      port: 5432,
      username: 'admin',
      password: 'admin',
      database: 'comments',
      entities: [Commentary],
      synchronize: true,
    }),
/*    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD.toString(),
      database: process.env.POSTGRES_DB,
      entities: [Commentary],
      synchronize: true,
    }),*/
    TypeOrmModule.forFeature([Commentary]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
