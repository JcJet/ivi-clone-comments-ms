import { NestFactory } from '@nestjs/core';
import { CommentsModule } from './comments.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(CommentsModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get('RABBIT_MQ_URI')],
      queue: 'toCommentsMs',
      queueOptions: {
        durable: false,
      },
    },
  });
  await app.startAllMicroservices();
}
bootstrap();
