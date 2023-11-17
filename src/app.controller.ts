import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { RabinService } from './rabin/rabin.service';
import { getTimestamp, toBufferLE } from './utils';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly rabinService: RabinService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/info')
  getInfo() {
    return {
      publicKey: toBufferLE(this.rabinService.publicKey).toString('hex'),
    };
  }

  private static readonly MARKER = {
    TIMESTAMP: 1,
    PRICE: 2,
    CHAININFO: 3,
  };

  @Get('/timestamp')
  getTimestamp() {
    const timestamp = getTimestamp();
    const data = Buffer.concat([
      toBufferLE(AppController.MARKER.TIMESTAMP, 1), // api marker, 1 byte
      toBufferLE(timestamp, 4), // timestamp, 4 bytes LE
    ]);
    const sigResponse = this.rabinService.sign(data);

    return {
      timestamp,
      ...sigResponse,
    };
  }

  @Get('price/:base/:coin')
  async getPrice(@Param('base') base: string, @Param('coin') coin: string) {
    const tradingPair = `${coin.toUpperCase()}-${base.toUpperCase()}`;
    const decimal = 4;
    const price = await this.appService.getOkxPrice(tradingPair, decimal);

    const timestamp = getTimestamp();
    const data = Buffer.concat([
      toBufferLE(AppController.MARKER.PRICE, 1), // api marker, 1 byte
      toBufferLE(timestamp, 4), // timestamp, 4 bytes LE
      toBufferLE(price, 8), // price, 8 bytes LE
      toBufferLE(decimal, 1), // decimal, 1 byte
      Buffer.from(tradingPair), // trading pair
    ]);
    const sigResponse = this.rabinService.sign(data);

    return {
      timestamp,
      tradingPair,
      price,
      decimal,
      ...sigResponse,
    };
  }

  @Get('chaininfo/:chain')
  async getChainInfo(@Param('chain') chain: string) {
    chain = chain.toUpperCase();
    const chainInfo = await this.appService.getChainInfo(chain);
    const height = chainInfo.blocks;
    const medianTimePast = chainInfo.mediantime;
    const bestBlockHash = chainInfo.bestblockhash;

    const timestamp = getTimestamp();
    const data = Buffer.concat([
      toBufferLE(AppController.MARKER.CHAININFO, 1), // api marker, 1 byte
      toBufferLE(timestamp, 4), // timestamp, 4 bytes LE
      toBufferLE(height, 4), // block height, 4 bytes LE
      toBufferLE(medianTimePast, 4), // medium time past, 4 bytes LE
      Buffer.from(bestBlockHash, 'hex'), // best block hash, 32 bytes
      Buffer.from(chain), // chain name
    ]);
    const sigResponse = this.rabinService.sign(data);

    return {
      timestamp,
      chain,
      height,
      bestBlockHash,
      medianTimePast,
      ...sigResponse,
    };
  }
}
