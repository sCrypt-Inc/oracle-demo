import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SigService } from './rabin/sig.service';
import { ConfigModule } from '@nestjs/config';
import { V1Controller } from './v1.controller';
import { V1Service } from './v1.service';

@Module({
  imports: [ConfigModule.forRoot({})],
  controllers: [AppController, V1Controller],
  providers: [SigService, V1Service],
})
export class AppModule {}
