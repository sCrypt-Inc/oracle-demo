import { Controller, Get } from '@nestjs/common';
import { SigService } from './rabin/sig.service';
import { toBufferLE } from './utils';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly rabinService: SigService) {}

  @Get()
  @ApiTags('info')
  @ApiOperation({ summary: 'health check' })
  healthCheck(): string {
    return 'OK';
  }

  @Get('/info')
  @ApiTags('info')
  @ApiOperation({ summary: 'get server Rabin public key' })
  getInfo() {
    return {
      publicKey: toBufferLE(this.rabinService.publicKey).toString('hex'),
    };
  }
}
