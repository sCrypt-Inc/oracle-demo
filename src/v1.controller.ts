import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { SigService } from './rabin/sig.service';
import { getTimestamp, toBufferLE } from './utils';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { V1Service } from './v1.service';

@Controller('v1')
export class V1Controller {
  constructor(
    private readonly v1Service: V1Service,
    private readonly rabinService: SigService,
  ) {}

  private static readonly MARKER = {
    TIMESTAMP: 1,
    PRICE: 2,
    CHAININFO: 3,
  };

  @Get('/timestamp')
  @ApiTags('v1')
  @ApiOperation({ summary: 'get timestamp' })
  getTimestamp() {
    const timestamp = getTimestamp();
    const data = Buffer.concat([
      toBufferLE(V1Controller.MARKER.TIMESTAMP, 1), // api marker, 1 byte
      toBufferLE(timestamp, 4), // timestamp, 4 bytes LE
    ]);
    const sigResponse = this.rabinService.sign(data);

    return {
      timestamp,
      ...sigResponse,
    };
  }

  @Get('price/:base/:query')
  @ApiTags('v1')
  @ApiOperation({ summary: 'get price of trading pair' })
  @ApiParam({
    name: 'base',
    required: true,
    type: String,
    description: 'base coin of the trading pair, case insensitive, e.g. USDT',
  })
  @ApiParam({
    name: 'query',
    required: true,
    type: String,
    description: 'query coin of the trading pair, case insensitive, e.g. BSV',
  })
  async getPrice(@Param('base') base: string, @Param('query') query: string) {
    const tradingPair = `${query.toUpperCase()}-${base.toUpperCase()}`;
    const decimal = 4;
    const price = await this.v1Service.getOkxPrice(tradingPair, decimal);

    const timestamp = getTimestamp();
    const data = Buffer.concat([
      toBufferLE(V1Controller.MARKER.PRICE, 1), // api marker, 1 byte
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
  @ApiTags('v1')
  @ApiOperation({ summary: 'get blockchain info' })
  @ApiParam({
    name: 'chain',
    required: true,
    type: String,
    description: 'chain name, case insensitive',
  })
  @ApiQuery({
    name: 'extra',
    required: false,
    type: String,
    description: 'extra signed fields: bestBlockHash,chainWork,medianTimePast',
  })
  async getChainInfo(
    @Param('chain') chain: string,
    @Query('extra') extra: string,
  ) {
    const optionalFields = ['bestblockhash', 'chainwork', 'mediantimepast'];
    const extraFields = extra
      ? extra.split(',').map((e) => e.trim().toLowerCase())
      : [];
    const unknownFields = extraFields.filter(
      (e) => !optionalFields.includes(e),
    );
    if (unknownFields.length > 0) {
      throw new HttpException(
        `unknown extra signed fields`,
        HttpStatus.BAD_REQUEST,
      );
    }
    // a marker that represents the extra signed fields
    // e.g. the index of `chainwork` in `optionalFields` is 1
    //   if extraFields includes `chainwork`
    //   then `extraMarker` & 00000010 would be 1
    let extraMarker = 0;
    extraFields.forEach((e) => (extraMarker |= 2 ** optionalFields.indexOf(e)));

    chain = chain.toUpperCase();
    const chainInfo = await this.v1Service.getChainInfo(chain);
    const height = chainInfo.blocks;
    const bestBlockHash = chainInfo.bestblockhash;
    const chainWork = chainInfo.chainwork;
    const medianTimePast = chainInfo.mediantime;

    // values in the same order as their keys in `optionalFields`
    const optionalSigned = [
      Buffer.from(bestBlockHash, 'hex'), // best block hash, 32 bytes
      Buffer.from(chainWork, 'hex'), // chain work, 32 bytes
      toBufferLE(medianTimePast, 4), // median time past, 4 bytes LE
    ];
    const extraSigned = optionalFields.map((e, i) =>
      extraFields.includes(e) ? optionalSigned[i] : Buffer.alloc(0),
    );

    const timestamp = getTimestamp();
    const data = Buffer.concat([
      toBufferLE(V1Controller.MARKER.CHAININFO, 1), // api marker, 1 byte
      toBufferLE(timestamp, 4), // timestamp, 4 bytes LE
      toBufferLE(height, 4), // block height, 4 bytes LE
      toBufferLE(extraMarker, 1), // extra signed marker, 1 byte
      ...extraSigned,
      Buffer.from(chain), // chain name
    ]);
    const sigResponse = this.rabinService.sign(data);

    return {
      timestamp,
      chain,
      height,
      bestBlockHash,
      chainWork,
      medianTimePast,
      extraSignedMarker: extraMarker,
      ...sigResponse,
    };
  }
}
