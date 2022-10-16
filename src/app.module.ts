import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HookModule } from './@hook/hook.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RouterModule.register([
      {
        path: 'api',
        module: AppModule,
      },
      {
        path: 'api',
        module: HookModule,
      },
    ]),
    ClientsModule.register([
      {
        name: 'TODAYS_LUNCH',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        },
      },
    ]),
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: '127.0.0.1',
    //   port: 3306,
    //   username: process.env.DB_USERNAME,
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_NAME,
    //   entities: [Channels],
    //   charset: 'utf8mb4',
    //   synchronize: false,
    // }),
    // TypeOrmModule.forFeature([Channels]),
    HookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
