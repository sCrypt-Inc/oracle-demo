import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getOkxPrice(tradingPair: string, decimal: number) {
    return axios
      .get(`https://www.okx.com/api/v5/market/ticker?instId=${tradingPair}`)
      .then((r) => Math.trunc(r.data.data[0].last * 10 ** decimal));
  }

  async getChainInfo(chain: string) {
    if (chain !== 'BSV') {
      throw new Error('not supported');
    }
    return axios
      .get('https://api.whatsonchain.com/v1/bsv/main/chain/info')
      .then((r) => r.data);
  }
}
