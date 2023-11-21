# oracle-demo

Vercel deployment of this Oracle service: https://oracle-demo.vercel.app/docs

A [code example](./test/priceBet.e2e-spec.ts#L42-L83) of how smart contract [PriceBet](./src/contracts/priceBet.ts) uses this Oracle.

## Installation

```bash
$ npm install
```

## Running the app

**Step 1**. Create a `.env` file under the project root directory from template `.env.example`.

Generate `RABIN_PRIV_P` and `RABIN_PRIV_Q` with command `npm run genRabinPrivKey`.

![](https://aaron67-public.oss-cn-beijing.aliyuncs.com/202311210711000.png)

Generate `PRIVATE_KEY` with command `npm run genBsvPrivKey`.

![](https://aaron67-public.oss-cn-beijing.aliyuncs.com/202311210709519.png)

**Step 2**. Run this app with the following commands.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

**Step 3**. View Swagger docs at http://localhost:3000/docs

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
