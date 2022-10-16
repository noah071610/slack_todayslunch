import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WebClient } from '@slack/web-api';
import { AppModule } from './app.module';
export const token = process.env.SLACK_API_TOKEN;
export const api = new WebClient(token);
export const myChannel = process.env.MY_CHANNEL;

async function bootstrap() {
  const micro = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.REDIS,
      options: {
        host: 'localhost',
        port: 6379,
      },
    },
  );
  await micro.listen();

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
