import * as path from "path";
import { PublicKey } from "@solana/web3.js";
import { CsvFile, csvHeaders } from "./csv_manager";
import { forOrAgainstFromString, nPricesFromLadder, seedMarketOutcome } from "./market_helpers";
import { floatListFromString, log, getProcessArgs } from "./utils";

async function seedFromCsv(csvName: string, forOutcome: boolean){
    const data = new CsvFile(
        {
            path: path.resolve(__dirname, "csvs/", csvName),
            headers: csvHeaders
        }
    )
    const dataPoints = await data.readAsObjects()
    log(`Loaded ${csvName}.csv ✅`)
    log(`Markets and outcomes from csv:`)
    dataPoints.map((dataPoint)=> {
        const marketPk = new PublicKey(dataPoint.marketPk)
        const outcome = dataPoint.outcome
        const forStakes = floatListFromString(dataPoint.forStakes)
        const againstStakes = floatListFromString(dataPoint.againstStakes)
        const forMidpoint = parseFloat(dataPoint.forMidpoint)
        const againstMidpoint = parseFloat(dataPoint.againstMidpoint)
        log(`Market ${dataPoint.marketPk} | Outcome: ${dataPoint.outcome} ℹ️`)
        if (dataPoint.seed === "TRUE"){
            if (forOutcome){
                log(`FOR midpoint ${forMidpoint} | Stakes: ${forStakes} ℹ️`)
                seedMarketOutcome(marketPk, forOutcome, outcome, nPricesFromLadder(forMidpoint, forStakes.length, forOutcome), forStakes)
            }
            else {
                log(`AGAINST midpoint ${againstMidpoint} : Stakes: ${againstStakes} ℹ️`)
                seedMarketOutcome(marketPk, forOutcome, outcome, nPricesFromLadder(againstMidpoint, againstStakes.length, forOutcome), againstStakes)
            }
        }
    })
}

const processArgs = getProcessArgs(["csvName", "forOutcome"], "npm run seedOutcomesFromCsv")
const csvName = processArgs.csvName
const forOutcome = forOrAgainstFromString(processArgs.forOutcome)
seedFromCsv(csvName, forOutcome)
