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
      urls: [configService.get('RMQ_URL')],
      queue: 'toCommentsMs',
      queueOptions: {
        durable: false,
      },
    },
  });
  await app.startAllMicroservices().then(() => {
    console.log('Comments MS started.');
    console.log('Application variables:');
    for (const var_name of ['RMQ_URL', 'DB_HOST']) {
      console.log(`${var_name}: ${configService.get(var_name)}`);
    }
  });
}
bootstrap();
