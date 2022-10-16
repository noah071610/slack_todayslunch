import { Module } from '@nestjs/common';
import { HookController } from './hook.controller';
import { HookService } from './hook.service';

@Module({
  // imports: [TypeOrmModule.forFeature([Channels])],
  controllers: [HookController],
  providers: [HookService],
})
export class HookModule {}
