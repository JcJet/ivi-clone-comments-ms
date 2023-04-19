import { RmqService } from '@app/common';
import { NestFactory } from '@nestjs/core';
import { CommentsModule } from './comments.module';

async function bootstrap() {
  const app = await NestFactory.create(CommentsModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('COMMENTS', true));
  await app.startAllMicroservices();
}
bootstrap();
