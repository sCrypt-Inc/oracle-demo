import { Global, Module } from '@nestjs/common';
import { RabinService } from './rabin.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [RabinService],
})
export class RabinModule {}
