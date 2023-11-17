# oracle-demo

Vercel deployment: https://oracle-demo.vercel.app/docs

## Installation

```bash
$ npm install
```

## Running the app

Generate your own Rabin private key then copy the output of the below command to a `.env` file under the project root directory.

```bash
# generate private key
$ npm run genPrivKey

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

Swagger runs at http://localhost:3000/docs.

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
