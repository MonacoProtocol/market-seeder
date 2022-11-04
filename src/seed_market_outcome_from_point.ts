import { PublicKey } from "@solana/web3.js";
import { getProcessArgs, floatListFromString } from "./utils";
import { forOrAgainstFromString,  nPricesFromLadder, seedMarketOutcome } from "./market_helpers";

const processArgs = getProcessArgs(["marketPk", "forOutcome", "outcome", "midPoint", "stakes"], "npm run seedMarketOutcome")
const marketPk = new PublicKey(processArgs.marketPk)
const forOutcome = forOrAgainstFromString(processArgs.forOutcome)
const outcome = processArgs.outcome
const midPoint = parseFloat(processArgs.midPoint)
const stakes = floatListFromString(processArgs.stakes)
const prices = nPricesFromLadder(midPoint, stakes.length, forOutcome)
seedMarketOutcome(marketPk, forOutcome, outcome, prices, stakes)
