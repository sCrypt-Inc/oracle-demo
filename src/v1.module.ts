import { Module } from '@nestjs/common';
import { SigService } from './rabin/sig.service';
import { ConfigModule } from '@nestjs/config';
import { V1Service } from './v1.service';
import { V1Controller } from './v1.controller';

@Module({
  imports: [ConfigModule.forRoot({})],
  controllers: [V1Controller],
  providers: [V1Service, SigService],
})
export class V1Module {}
