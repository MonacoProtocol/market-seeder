import { PublicKey } from "@solana/web3.js";
import { getMarketOutcomeTitlesByMarket, createOrderUiStake, getMarketAccountsByStatusAndMintAccount, MarketStatus } from "@monaco-protocol/client";
import { getProgram, log, logOk, logResponse } from "./utils";

const DEFAULT_PRICE_LADDER = [
    1.001, 1.002, 1.003, 1.004, 1.005, 1.006, 1.007, 1.008, 1.009, 1.01, 1.02,
    1.03, 1.04, 1.05, 1.06, 1.07, 1.08, 1.09, 1.1, 1.11, 1.12, 1.13, 1.14, 1.15,
    1.16, 1.17, 1.18, 1.19, 1.2, 1.21, 1.22, 1.23, 1.24, 1.25, 1.26, 1.27, 1.28,
    1.29, 1.3, 1.31, 1.32, 1.33, 1.34, 1.35, 1.36, 1.37, 1.38, 1.39, 1.4, 1.41,
    1.42, 1.43, 1.44, 1.45, 1.46, 1.47, 1.48, 1.49, 1.5, 1.51, 1.52, 1.53, 1.54,
    1.55, 1.56, 1.57, 1.58, 1.59, 1.6, 1.61, 1.62, 1.63, 1.64, 1.65, 1.66, 1.67,
    1.68, 1.69, 1.7, 1.71, 1.72, 1.73, 1.74, 1.75, 1.76, 1.77, 1.78, 1.79, 1.8,
    1.81, 1.82, 1.83, 1.84, 1.85, 1.86, 1.87, 1.88, 1.89, 1.9, 1.91, 1.92, 1.93,
    1.94, 1.95, 1.96, 1.97, 1.98, 1.99, 2, 2.01, 2.02, 2.03, 2.04, 2.05, 2.06,
    2.07, 2.08, 2.09, 2.1, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19,
    2.2, 2.22, 2.24, 2.26, 2.28, 2.3, 2.32, 2.34, 2.36, 2.38, 2.4, 2.42, 2.44,
    2.46, 2.48, 2.5, 2.52, 2.54, 2.56, 2.58, 2.6, 2.62, 2.64, 2.66, 2.68, 2.7,
    2.72, 2.74, 2.76, 2.78, 2.8, 2.82, 2.84, 2.86, 2.88, 2.9, 2.92, 2.94, 2.96,
    2.98, 3, 3.05, 3.1, 3.15, 3.2, 3.25, 3.3, 3.35, 3.4, 3.45, 3.5, 3.55, 3.6,
    3.65, 3.7, 3.75, 3.8, 3.85, 3.9, 3.95, 4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7,
    4.8, 4.9, 5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6, 6.2, 6.4, 6.6,
    6.8, 7, 7.2, 7.4, 7.6, 7.8, 8, 8.2, 8.4, 8.6, 8.8, 9, 9.2, 9.4, 9.6, 9.8, 10,
    10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5,
    18, 18.5, 19, 19.5, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 34, 36,
    38, 40, 42, 44, 46, 48, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120,
    130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270,
    280, 290, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 500, 550, 600,
    650, 700, 750, 800, 900, 1000,
  ];

export function nPricesFromLadder(midPoint: number, noOfPrices: number, forOutcome: boolean) {
    let toSplice = [...DEFAULT_PRICE_LADDER];
    if (!forOutcome){
        toSplice = [...DEFAULT_PRICE_LADDER.reverse()]
    }
    const index = toSplice.indexOf(midPoint);
    let spliced = toSplice.splice(index);
    spliced = spliced.splice(0, noOfPrices);
    while (spliced.length < noOfPrices) {
      spliced.push(midPoint);
    }
    return spliced;
}


type MarketOutcomeMapping = {
    marketPk: PublicKey,
    marketTitle: string,
    marketType: string,
    outcome: string
}

export async function getOpenMarketsOutcomeMappingByToken(token: PublicKey){
    const program = await getProgram()
    const marketsResponse = await getMarketAccountsByStatusAndMintAccount(program, MarketStatus.Open, token)
    // There are a lot of open markets so filtering by lock time to reduce the amount returned for now
    const filteredMarkets = marketsResponse.data.markets.filter(market => market.account.marketLockTimestamp.toNumber() > 1666393200)
    const marketOutcomeMap = [] as MarketOutcomeMapping[]
    for (const market of filteredMarkets) {
        log(`Mapping outcomes for market: ${market.publicKey.toString()} ⏱`)
        const outcomes = await getMarketOutcomeTitlesByMarket(program, new PublicKey(market.publicKey))
        outcomes.data.marketOutcomeTitles.map((outcome) => {
            marketOutcomeMap.push(
                {
                    marketPk: market.publicKey,
                    marketTitle: market.account.title,
                    marketType: market.account.marketType,
                    outcome: outcome
                }
            )
        })
    }
    return marketOutcomeMap
}

export async function getIndexForOutcome(marketPk: PublicKey, outcome: string){
    const program = await getProgram()
    log(`Validating and getting index for outcome: ${outcome}`)
    const marketOutcomes = await getMarketOutcomeTitlesByMarket(program, marketPk)
    const outcomes = marketOutcomes.data.marketOutcomeTitles
    const indexOfOutcome = outcomes.indexOf(outcome)
    if (indexOfOutcome != -1){
        logOk()
        return indexOfOutcome
    }
    else {
        throw new Error(`${outcome} not found in outcomes: [${outcomes}]`)
    }
}

type PriceValidation = {
    pricesValid: boolean,
    invalidPrices: number[]
}

export function validatePricesAgainstLadder(prices: number[]): PriceValidation{
    log(`Validating supplied prices ⏱`)
    let pricesValid = true
    let invalidPrices = [] as number[]
    prices.map((price) => {
        if (!DEFAULT_PRICE_LADDER.includes(price)){
            pricesValid = false
            invalidPrices.push(price)
        }
    })
    if (pricesValid) logOk()
    return {
        pricesValid: pricesValid,
        invalidPrices: invalidPrices
    }
}

export function validatePricesAndStakes(prices: number[], stakes: number[]): boolean{
    log(`Validating that each price has a corresponding stake ⏱`)
    if (prices.length != stakes.length) return false
    else logOk() ; return true
}

export function forOrAgainstFromBool(forOutcome: boolean): string{
    if (forOutcome) return "for"
    else return "against"
}

export function forOrAgainstFromString(forOutcome: string): boolean{
    switch (forOutcome){
        case "for":
          return true  
        case "against":
          return false 
        default:
          throw "Available backing options: for, against" 
      }
}

export async function seedMarketOutcome(marketPk: PublicKey, forOutcome: boolean, outcome: string, prices: number[], stakes: number[]){
    const program = await getProgram()
    if (!validatePricesAndStakes(prices, stakes)){
        log(`ERROR: Each price must have a corresponding stake`)
    }
    const validatePrices = validatePricesAgainstLadder(prices)
    if (!validatePrices.pricesValid){
        log(`ERROR: Invalid prices supplied: ${validatePrices.invalidPrices} ⚠️`)
    }
    const marketOutcomeIndex = await getIndexForOutcome(marketPk, outcome)
    prices.map(async (price, i) => {
        const stake = stakes[i]
        log(`Placing order @ ${price} for $${stake} ${forOrAgainstFromBool(forOutcome)} ${outcome} - index of ${marketOutcomeIndex} ✨`)
        if (!process.env.SEED_DRYRUN){
            const response = await createOrderUiStake(program, marketPk, marketOutcomeIndex, forOutcome, price, stake)
            logResponse(response)
        }
    })
}