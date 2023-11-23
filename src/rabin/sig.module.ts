import { Global, Module } from '@nestjs/common';
import { SigService } from './sig.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [SigService],
})
export class RabinModule {}
