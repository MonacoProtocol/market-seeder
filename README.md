# Market Seeder

Tool for seeding markets on The Monaco Protocol.

⚠️ This tool is currently set up to run against the `stable` version of the protocol on `devnet` ⚠️

# Setup

## Prerequisites

- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) for wallet generation
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install dependencies
- Two CLI wallets
  - One to place FOR orders
  - One to place AGAINST orders
  - If you use the same wallet when placing for and against orders, your current exposure would be used to manage risk
  - Be sure to note the publicKey of the wallets in order to fund them with SOL and the token(s) used for the markets you are seeding

```
mkdir wallet
solana-keygen new -o wallet/for.json
solana-keygen new -o wallet/against.json
```

⚠️ The `wallet` dir is specified in `.gitignore` to help ensure you do not commit your wallet ⚠️

## Installation

```
npm install
```

## Environment Settings

### Dryrun Setting

Use this setting to view what orders would be placed without actually placing them.

```
export SEED_DRYRUN=y
```

To clear the dryrun setting use `unset`

```
unset SEED_DRYRUN
```

### RPC Node

```
export ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
```

⚠️ Note that the solana devnet rpc cluster is subject to rate limiting and is used here as an example - so you will want to point at your own node to perform multiple actions ⚠️

### Funding Wallets

Select a wallet depending on whether or not you are for or against an outcome.

```
export ANCHOR_WALLET=./wallet/for.json
```
```
export ANCHOR_WALLET=./wallet/against.json
```

# Generate Seeding CSV

In order to generate a CSV to seed from run:

```
npm run generateSeedCsv <output csv name> <token name>
```

This will currently get all:

- Open markets
- Using the supplied token name for order placement
- Where the lock time is after Oct 21st (to eliminate a number of non-settled markets)

Some tokens have been mapped so you can pass in a shorthand name for them. Currently mapped tokens:

- Devnet: `betcoin, wins`
- Mainnet: `usdc, usdt`

For any other token, pass in the full publicKey.

This script will generate a CSV breaking down the outcomes for each market, with default midpoints and stakes applied. You can then edit this file prior to running `seedOutcomesFromCsv`.

# Seeding From CSV

To seed from a CSV file containing markets, mid-points and stakes, first you need a file located in [src/csvs](src/csvs/) following the format of the [example.csv](src/csvs/example.csv). Each line of the CSV should represent an outcome on a market. The CSV can contain multiple markets and outcomes.

⚠️ Maket outcomes will only be seeded if the `seed` value in the csv reads `TRUE` ⚠️

```
marketPk,marketTitle,marketType,outcome,forMidpoint,forStakes,againstMidpoint,againstStakes,seed
FiSjaKqEWpjrMNaQuYpToSscUbYhHpioqegV8tH5LWnu,Full Time Result,EventResultFullTime,Benfica,2.08,"500, 250, 125",2.03,"500, 250, 125",TRUE
FiSjaKqEWpjrMNaQuYpToSscUbYhHpioqegV8tH5LWnu,Full Time Result,EventResultFullTime,Draw,3.85,"100, 50, 25",3.45,"50, 20, 10",FALSE
FiSjaKqEWpjrMNaQuYpToSscUbYhHpioqegV8tH5LWnu,Full Time Result,EventResultFullTime,Juventus,4.5,"50, 50, 50",3.85,"50, 50, 50",FALSE

```

You can then seed the markets and outcomes in the CSV by running:

```
npm run seedOutcomesFromCsv <csv name> <for | against>
```

## Example

For the example CSV, orders on the market `FiSjaKqEWpjrMNaQuYpToSscUbYhHpioqegV8tH5LWnu` would be placed for these FOR outcomes:

- Benfica @ a midpoint of 2.08 with stakes of $500, $250, $125
- Draw @ a midpoint of 3.85 with stakes of $100, $50, $25
- Juventus @ a midpoint of 4.5 with stakes of $50, $50, $50

```
npm run seedOutcomesFromCsv example for
```

# Seeding From Mid-Point

To seed from a specified mid-point on the price ladder run the following command:

```
npm run seedMarketOutcome <market publicKey> <for | against> <outcome title> <outcome mid-point> "<comma separated list of stakes>"
```

This script will:

- Validate whether or not the outcome provided exists on the market
- Validate the supplied price point
- Generate price points using the mid-point as a starting position
- Depending on whether or not you are seeding FOR or AGAINST, the supplied price points will either go up the ladder (FOR) or down (AGAINST)
- Place orders where the stakes supplied map to the generated prices (the first stake will always be the mid-point stake)

## Example

- Price Ladder snippet `9.2, 9.4, 9.6, 9.8, 10, 10.5, 11, 11.5, 12`

Place an order AGAINST Liverpool with a mid-point of `10` with 4 stake values

- 10 $1000
- 9.8 $500
- 9.6 $200
- 9.4 $50

```
npm run seedMarketOutcome 48sthHs2WndgtoJ6zqXqUkmBECFvQw8BydYiwrpjQxMZ against "Liverpool" 10 "1000, 500, 200, 50"
```

# Manual Seeder

To manually seed a market, you can run the following command:

```
npm run seedMarketOutcomeManual <market publicKey> <for | against> <outcome title> "<comma separated list of prices>" "<comma separated list of stakes>"
```

The script will:

- Validate supplied arguments in the same manner as the mid-point script
- Place an order with a 1:1 mapping between the supplied prices and stakes

## Examples

Place an order AGAINST Liverpool at the following prices and stakes:

- 3.25 $1000
- 3.3 $500
- 3.35 $250
- 4.1 $50

```
npm run seedMarketOutcomeManual 48sthHs2WndgtoJ6zqXqUkmBECFvQw8BydYiwrpjQxMZ against "Liverpool" "3.25, 3.3, 3.35, 4.1" "1000, 500, 250 50"
```

# Price Ladder Note

Please note that the price ladder currently used by this tool is currently hardcoded in [market_helpers.ts](src/market_helpers.ts) - this is a copy of the `DEFAULT_PRICE_LADDER` shipped with [The Monaco Protocol Admin Client](https://github.com/MonacoProtocol/admin-client/blob/main/types/default_price_ladder.ts). In the future there will be an option to pull the price ladder from the market outcome account in order to support custom price ladder markets.
