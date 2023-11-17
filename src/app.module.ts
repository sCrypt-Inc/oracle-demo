import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabinService } from './rabin/rabin.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({})],
  controllers: [AppController],
  providers: [AppService, RabinService],
})
export class AppModule {}
