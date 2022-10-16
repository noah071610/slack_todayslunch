import { Body, Controller, Post } from '@nestjs/common';
import { HookService } from './hook.service';

@Controller('hook')
export class HookController {
  constructor(private readonly hookService: HookService) {}

  @Post('/list')
  sendRestaurantList(@Body() body) {
    this.hookService.sendRestaurantList(body);
  }

  @Post('/restaurant')
  addRestaurant(@Body() body) {
    this.hookService.addRestaurant(body);
  }
}
