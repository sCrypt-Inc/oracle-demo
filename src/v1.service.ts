import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class V1Service {
  /**
   * @param tradingPair e.g. `BSV-USDT`, `BTC-USDC`, etc
   * @param decimal decimal of the returned price
   * @returns returns an integer representing the price of the trading pair, e.g. return 1234 with decimal 2 means 12.34
   */
  async getOkxPrice(tradingPair: string, decimal: number) {
    return axios
      .get(`https://www.okx.com/api/v5/market/ticker?instId=${tradingPair}`)
      .then((r) => Math.trunc(r.data.data[0].last * 10 ** decimal));
  }

  /**
   * @see {@link https://docs.taal.com/core-products/whatsonchain/chain-info#get-blockchain-info}
   */
  async getChainInfo(chain: string) {
    if (chain !== 'BSV') {
      throw new Error('not supported');
    }
    return axios
      .get('https://api.whatsonchain.com/v1/bsv/main/chain/info')
      .then((r) => r.data);
  }
}
