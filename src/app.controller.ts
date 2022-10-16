import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/register')
  sendRegisterMessage() {
    return this.appService.sendRegisterMessage();
  }
  @Get('/vote')
  sendVoteMessage() {
    return this.appService.sendVoteMessage();
  }

  @Post('/result')
  getResult(@Body() body) {
    return this.appService.getResult(JSON.parse(body.payload));
  }
}
