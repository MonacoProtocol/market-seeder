import { PublicKey } from "@solana/web3.js";
import { getProcessArgs, floatListFromString } from "./utils";
import { forOrAgainstFromString, seedMarketOutcome } from "./market_helpers";

const processArgs = getProcessArgs(["marketPk", "forOutcome", "outcome", "prices", "stakes"], "npm run seedMarketOutcomeManual")
const marketPk = new PublicKey(processArgs.marketPk)
const forOutcome = forOrAgainstFromString(processArgs.forOutcome)
const outcome = processArgs.outcome
const prices = floatListFromString(processArgs.prices)
const stakes = floatListFromString(processArgs.stakes)
seedMarketOutcome(marketPk, forOutcome, outcome, prices, stakes)
